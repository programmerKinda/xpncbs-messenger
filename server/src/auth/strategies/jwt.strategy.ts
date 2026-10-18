import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { AuthService } from '../auth.service';

import { User } from '../entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true,

      ignoreExpiration: false,

      secretOrKey: process.env.JWT_SECRET || 'dev-secret',
    });
  }

  async validate(
    request: { headers: { authorization?: string; 'user-agent'?: string }; ip?: string },
    payload: { sub: string; sid?: string },
  ) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
    if (
      !token ||
      !(await this.authService.validateSession(payload.sub, payload.sid, token, {
        userAgent: request.headers['user-agent'],
        ipAddress: request.ip,
      }))
    ) {
      throw new UnauthorizedException('Сеанс завершён');
    }
    return this.userRepository.findOne({ where: { id: payload.sub } });
  }
}
