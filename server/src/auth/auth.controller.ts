import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { extname, join } from 'node:path';

import { AuthService } from './auth.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

const avatarUploadDirectory = join(process.cwd(), 'uploads', 'avatars');
mkdirSync(avatarUploadDirectory, { recursive: true });

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-code')
  sendCode(@Body('phone') phone: string) {
    return this.authService.sendCode(phone);
  }

  @Post('verify-code')
  verifyCode(@Body('phone') phone: string, @Body('code') code: string) {
    return this.authService.verifyCode(phone, code);
  }

  @Post('profile')
  createProfile(@Body() createProfileDto: CreateProfileDto) {
    return this.authService.createProfile(createProfileDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: any) {
    return req.user;
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @Req() request: { user: { id: string } },
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(request.user.id, updateProfileDto);
  }

  @Post('profile/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: avatarUploadDirectory,
        filename: (_request, file, callback) => {
          callback(
            null,
            `${randomUUID()}${extname(file.originalname) || '.jpg'}`,
          );
        },
      }),
    }),
  )
  uploadAvatar(
    @UploadedFile() file: { filename: string } | undefined,
    @Req() request: { user: { id: string } },
  ) {
    if (!file) {
      throw new BadRequestException('Файл аватара не передан');
    }

    return this.authService.updateAvatar(
      request.user.id,
      `/api/uploads/avatars/${file.filename}`,
    );
  }
}
