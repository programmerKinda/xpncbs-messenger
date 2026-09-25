import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { DataSource, Repository } from 'typeorm';

import { ChatService } from '../chat/chat.service';
import { User } from './entities/user.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  private codes = new Map<string, string>();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,

    private readonly dataSource: DataSource,

    private readonly chatService: ChatService,
  ) {}

  private normalizePhone(phone: string): string {
    return `+${phone.replace(/\D/g, '')}`;
  }

  private generateToken(user: User) {
    return this.jwtService.sign({
      sub: user.id,
    });
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

  async verifyCode(phone: string, code: string) {
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
      const accessToken = this.generateToken(user);

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

  async createProfile(data: CreateProfileDto) {
    const normalizedPhone = this.normalizePhone(data.phone);

    const savedUser = await this.dataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(User);
      const user = userRepository.create({
        ...data,
        phone: normalizedPhone,
      });
      const createdUser = await userRepository.save(user);

      await this.chatService.createSavedMessagesChat(createdUser, manager);

      return createdUser;
    });

    const accessToken = this.generateToken(savedUser);

    return {
      success: true,
      user: savedUser,
      accessToken,
    };
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
