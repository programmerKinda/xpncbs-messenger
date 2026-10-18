import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageType } from './entities/message.entity';
import { StickerService } from '../stickers/sticker.service';

const voiceUploadDirectory = join(process.cwd(), 'uploads', 'voice');
const circleUploadDirectory = join(process.cwd(), 'uploads', 'circle');
mkdirSync(voiceUploadDirectory, { recursive: true });
mkdirSync(circleUploadDirectory, { recursive: true });

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
    private readonly stickerService: StickerService,
  ) {}

  @Get()
  findMine(
    @Req() request: { user: { id: string } },
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.chatService.findForUser(request.user.id, Number(limit) || 20, cursor);
  }

  @Get('lookup/:chatKey')
  findByRouteKey(
    @Param('chatKey') chatKey: string,
    @Req() request: { user: { id: string } },
  ) {
    return this.chatService.findByRouteKey(request.user.id, chatKey);
  }

  @Post('direct/:username')
  findOrCreateDirectChat(
    @Param('username') username: string,
    @Req() request: { user: { id: string } },
  ) {
    return this.chatService.findOrCreateDirectChat(request.user.id, username);
  }

  @Post(':chatId/read')
  markRead(
    @Param('chatId') chatId: string,
    @Req() request: { user: { id: string } },
  ) {
    return this.chatService.markChatRead(chatId, request.user.id);
  }

  @Get(':chatId/messages')
  findMessages(
    @Param('chatId') chatId: string,
    @Req() request: { user: { id: string } },
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    return this.chatService.findMessagesForUser(
      chatId,
      request.user.id,
      Number(limit) || 50,
      before,
    );
  }

  @Post(':chatId/messages')
  async createMessage(
    @Param('chatId') chatId: string,
    @Body() data: CreateMessageDto,
    @Req() request: { user: { id: string } },
  ) {
    if (data.type === MessageType.STICKER) {
      const stickerId =
        typeof data.content === 'object' && data.content !== null
          ? data.content.stickerId
          : undefined;
      if (typeof stickerId !== 'string') {
        throw new BadRequestException('Не указан стикер');
      }

      const sticker = await this.stickerService.findForUser(stickerId, request.user.id);
      data.content = {
        stickerId: sticker.id,
        url: `/api/stickers/${encodeURIComponent(sticker.fileName)}`,
        alt: sticker.title,
      };
    }

    const message = await this.chatService.createMessageForUser(
      chatId,
      request.user.id,
      data.type,
      data.content,
    );
    this.chatGateway.broadcastMessage(message);
    return message;
  }

  @Post(':chatId/messages/voice')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: voiceUploadDirectory,
        filename: (_request, file, callback) => {
          callback(
            null,
            `${randomUUID()}${extname(file.originalname) || '.webm'}`,
          );
        },
      }),
    }),
  )
  async createVoiceMessage(
    @Param('chatId') chatId: string,
    @UploadedFile() file: { filename: string } | undefined,
    @Body('duration') duration: string,
    @Body('waveform') waveform: string,
    @Req() request: { user: { id: string } },
  ) {
    if (!file) {
      throw new BadRequestException('Голосовой файл не передан');
    }

    let parsedWaveform: number[] = [];
    try {
      parsedWaveform = JSON.parse(waveform || '[]') as number[];
    } catch {
      throw new BadRequestException('Некорректная waveform');
    }

    const message = await this.chatService.createMessageForUser(
      chatId,
      request.user.id,
      MessageType.VOICE,
      {
        id: randomUUID(),
        duration: Number(duration) || 0,
        waveform: parsedWaveform,
        content: `/api/uploads/voice/${file.filename}`,
      },
    );
    this.chatGateway.broadcastMessage(message);
    return message;
  }

  @Post(':chatId/messages/circle')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: circleUploadDirectory,
        filename: (_request, file, callback) => {
          callback(
            null,
            `${randomUUID()}${extname(file.originalname) || '.webm'}`,
          );
        },
      }),
    }),
  )
  async createCircleMessage(
    @Param('chatId') chatId: string,
    @UploadedFile() file: { filename: string } | undefined,
    @Body('duration') duration: string,
    @Req() request: { user: { id: string } },
  ) {
    if (!file) {
      throw new BadRequestException('Видео кружочка не передано');
    }

    const message = await this.chatService.createMessageForUser(
      chatId,
      request.user.id,
      MessageType.CIRCLE,
      {
        id: randomUUID(),
        duration: Number(duration) || 0,
        content: `/api/uploads/circle/${file.filename}`,
        watched: false,
      },
    );
    this.chatGateway.broadcastMessage(message);
    return message;
  }
}
