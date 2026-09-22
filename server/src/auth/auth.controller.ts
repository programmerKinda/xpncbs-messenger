import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('send-code')
  sendCode(@Body('phone') phone: string) {
    return this.authService.sendCode(phone);
  }

  @Post('verify-code')
  verifyCode(
    @Body('phone') phone: string,
    @Body('code') code: string,
  ) {
    return this.authService.verifyCode(phone, code);
  }

  @Post('profile')
  createProfile(
    @Body() createProfileDto: CreateProfileDto,
  ) {
    return this.authService.createProfile(
      createProfileDto,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: any) {
    return req.user;
  }
}