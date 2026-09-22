import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { CreateProfileDto } from './dto/create-profile.dto';

@Injectable()
export class AuthService {
  private codes = new Map<string, string>();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
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

    const code = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

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

    const user = this.userRepository.create({
      ...data,
      phone: normalizedPhone,
    });

    const savedUser = await this.userRepository.save(user);

    const accessToken = this.generateToken(savedUser);

    return {
      success: true,
      user: savedUser,
      accessToken,
    };
  }
}