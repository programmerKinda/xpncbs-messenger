import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomUUID } from 'node:crypto';
import { DataSource, IsNull, Repository } from 'typeorm';

import { ChatService } from '../chat/chat.service';
import { AuthSession } from './entities/auth-session.entity';
import { User } from './entities/user.entity';
import { StickerPack } from '../stickers/entities/sticker-pack.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  private codes = new Map<string, string>();
  private readonly sessionLifetimeMs = 30 * 24 * 60 * 60 * 1000;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(AuthSession)
    private readonly sessionRepository: Repository<AuthSession>,

    private readonly jwtService: JwtService,

    private readonly dataSource: DataSource,

    private readonly chatService: ChatService,
  ) {}

  private normalizePhone(phone: string): string {
    return `+${phone.replace(/\D/g, '')}`;
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private async createSession(
    user: User,
    token: string,
    sessionId: string,
    context: { userAgent?: string; ipAddress?: string },
  ) {
    const now = new Date();
    const session = this.sessionRepository.create({
      id: sessionId,
      userId: user.id,
      tokenHash: this.hashToken(token),
      userAgent: context.userAgent?.slice(0, 500) ?? null,
      ipAddress: context.ipAddress?.slice(0, 100) ?? null,
      lastActiveAt: now,
      expiresAt: new Date(now.getTime() + this.sessionLifetimeMs),
      revokedAt: null,
    });
    await this.sessionRepository.save(session);
  }

  private async generateToken(
    user: User,
    context: { userAgent?: string; ipAddress?: string },
  ) {
    const sessionId = randomUUID();
    const accessToken = this.jwtService.sign({ sub: user.id, sid: sessionId });
    await this.createSession(user, accessToken, sessionId, context);
    return accessToken;
  }

  sendCode(phone: string) {
    const normalizedPhone = this.normalizePhone(phone);

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    this.codes.set(normalizedPhone, code);

    console.log(`Phone: ${normalizedPhone}`);
    console.log(`SMS code: ${code}`);

    return {
      success: true,
    };
  }

  async verifyCode(
    phone: string,
    code: string,
    context: { userAgent?: string; ipAddress?: string } = {},
  ) {
    const normalizedPhone = this.normalizePhone(phone);

    const savedCode = this.codes.get(normalizedPhone);

    if (!savedCode) {
      return {
        success: false,
        message: 'Код не найден или истёк',
      };
    }

    if (savedCode !== code) {
      return {
        success: false,
        message: 'Неверный код',
      };
    }

    this.codes.delete(normalizedPhone);

    const user = await this.userRepository.findOne({
      where: {
        phone: normalizedPhone,
      },
    });

    // Пользователь существует
    if (user) {
      const accessToken = await this.generateToken(user, context);

      return {
        success: true,
        exists: true,
        accessToken,
      };
    }

    // Новый пользователь
    return {
      success: true,
      exists: false,
      phone: normalizedPhone,
    };
  }

  async createProfile(
    data: CreateProfileDto,
    context: { userAgent?: string; ipAddress?: string } = {},
  ) {
    const normalizedPhone = this.normalizePhone(data.phone);

    const savedUser = await this.dataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(User);
      const user = userRepository.create({
        ...data,
        phone: normalizedPhone,
      });
      const createdUser = await userRepository.save(user);

      const defaultStickerPack = await manager.getRepository(StickerPack).findOne({
        where: { isDefault: true },
      });
      if (defaultStickerPack) {
        await manager
          .createQueryBuilder()
          .relation(User, 'stickerPacks')
          .of(createdUser.id)
          .add(defaultStickerPack.id);
      }

      await this.chatService.createSavedMessagesChat(createdUser, manager);

      return createdUser;
    });

    const accessToken = await this.generateToken(savedUser, context);

    return {
      success: true,
      user: savedUser,
      accessToken,
    };
  }

  async listSessions(
    userId: string,
    accessToken: string,
    context: { userAgent?: string; ipAddress?: string } = {},
  ) {
    const tokenHash = this.hashToken(accessToken);
    let currentSession = await this.sessionRepository.findOne({
      where: { userId, tokenHash },
    });

    if (!currentSession) {
      const sessionId = randomUUID();
      const now = new Date();
      currentSession = await this.sessionRepository.save(
        this.sessionRepository.create({
          id: sessionId,
          userId,
          tokenHash,
          userAgent: context.userAgent?.slice(0, 500) ?? null,
          ipAddress: context.ipAddress?.slice(0, 100) ?? null,
          lastActiveAt: now,
          expiresAt: new Date(now.getTime() + this.sessionLifetimeMs),
          revokedAt: null,
        }),
      );
    } else {
      currentSession.lastActiveAt = new Date();
      currentSession.userAgent ??= context.userAgent?.slice(0, 500) ?? null;
      currentSession.ipAddress ??= context.ipAddress?.slice(0, 100) ?? null;
      await this.sessionRepository.save(currentSession);
    }

    const sessions = await this.sessionRepository.find({
      where: { userId, revokedAt: IsNull() },
      order: { lastActiveAt: 'DESC' },
    });

    return sessions
      .filter((session) => session.expiresAt > new Date())
      .map((session) => ({
        id: session.id,
        userAgent: session.userAgent,
        ipAddress: session.ipAddress,
        createdAt: session.createdAt,
        lastActiveAt: session.lastActiveAt,
        isCurrent: session.tokenHash === tokenHash,
      }));
  }

  async revokeSession(userId: string, sessionId: string, currentToken: string) {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, userId, revokedAt: IsNull() },
    });

    if (!session) throw new NotFoundException('Сеанс не найден');
    if (session.tokenHash === this.hashToken(currentToken)) {
      throw new BadRequestException('Нельзя завершить текущий сеанс отсюда');
    }

    session.revokedAt = new Date();
    await this.sessionRepository.save(session);
    return { success: true };
  }

  async validateSession(
    userId: string,
    sessionId: string | undefined,
    token: string,
    context: { userAgent?: string; ipAddress?: string } = {},
  ) {
    const where = sessionId
      ? { id: sessionId, userId }
      : { tokenHash: this.hashToken(token), userId };
    let session = await this.sessionRepository.findOne({ where });

    if (!session) {
      if (sessionId) return false;
      const now = new Date();
      session = await this.sessionRepository.save(
        this.sessionRepository.create({
          id: randomUUID(),
          userId,
          tokenHash: this.hashToken(token),
          userAgent: context.userAgent?.slice(0, 500) ?? null,
          ipAddress: context.ipAddress?.slice(0, 100) ?? null,
          lastActiveAt: now,
          expiresAt: new Date(now.getTime() + this.sessionLifetimeMs),
          revokedAt: null,
        }),
      );
      return true;
    }
    if (session.revokedAt || session.expiresAt <= new Date()) return false;

    session.lastActiveAt = new Date();
    session.userAgent ??= context.userAgent?.slice(0, 500) ?? null;
    session.ipAddress ??= context.ipAddress?.slice(0, 100) ?? null;
    await this.sessionRepository.save(session);
    return true;
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    user.firstName = data.firstName?.trim() || user.firstName;
    user.lastName = data.lastName?.trim() || null;
    user.username = data.username?.trim() || null;
    user.about = data.about?.trim() || null;

    return this.userRepository.save(user);
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    user.avatarUrl = avatarUrl;
    return this.userRepository.save(user);
  }
}
