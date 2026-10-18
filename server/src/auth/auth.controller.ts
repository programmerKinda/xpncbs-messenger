import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Ip,
  Param,
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
import { ChatGateway } from '../chat/chat.gateway';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

const avatarUploadDirectory = join(process.cwd(), 'uploads', 'avatars');
mkdirSync(avatarUploadDirectory, { recursive: true });

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Post('send-code')
  sendCode(@Body('phone') phone: string) {
    return this.authService.sendCode(phone);
  }

  @Post('verify-code')
  verifyCode(
    @Body('phone') phone: string,
    @Body('code') code: string,
    @Headers('user-agent') userAgent: string | undefined,
    @Ip() ipAddress: string,
  ) {
    return this.authService.verifyCode(phone, code, { userAgent, ipAddress });
  }

  @Post('profile')
  createProfile(
    @Body() createProfileDto: CreateProfileDto,
    @Headers('user-agent') userAgent: string | undefined,
    @Ip() ipAddress: string,
  ) {
    return this.authService.createProfile(createProfileDto, { userAgent, ipAddress });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: any) {
    return req.user;
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  listSessions(
    @Req() request: { user: { id: string } },
    @Headers('authorization') authorization: string | undefined,
    @Headers('user-agent') userAgent: string | undefined,
    @Ip() ipAddress: string,
  ) {
    const token = authorization?.replace(/^Bearer\s+/i, '') ?? '';
    return this.authService.listSessions(request.user.id, token, { userAgent, ipAddress });
  }

  @Post('sessions/:id/revoke')
  @UseGuards(JwtAuthGuard)
  revokeSession(
    @Req() request: { user: { id: string } },
    @Param('id') sessionId: string,
    @Headers('authorization') authorization: string | undefined,
  ) {
    const token = authorization?.replace(/^Bearer\s+/i, '') ?? '';
    return this.authService.revokeSession(request.user.id, sessionId, token).then(async (result) => {
      await this.chatGateway.disconnectAuthSession(sessionId);
      return result;
    });
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
