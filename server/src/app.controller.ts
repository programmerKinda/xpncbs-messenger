import { Controller, Get, Param, Post, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { pipeline } from 'node:stream';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { VKVideoService } from './vkvideo.service';
import { YouTubePreviewService } from './youtube-preview.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly youTubePreviewService: YouTubePreviewService,
    private readonly vkVideoService: VKVideoService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return { status: 'ok' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('youtube/:videoId')
  getYouTubePreview(@Param('videoId') videoId: string) {
    return this.youTubePreviewService.getPreview(videoId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('vkvideo/:videoId')
  getVKVideoPreview(@Param('videoId') videoId: string) {
    return this.vkVideoService.getPreview(videoId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('vkvideo/:videoId/download-ticket')
  createVKVideoDownloadTicket(@Param('videoId') videoId: string) {
    return { ticket: this.vkVideoService.createDownloadTicket(videoId) };
  }

  @UseGuards(JwtAuthGuard)
  @Post('youtube/:videoId/download-ticket')
  createYouTubeDownloadTicket(@Param('videoId') videoId: string) {
    return {
      ticket: this.youTubePreviewService.createDownloadTicket(videoId),
    };
  }

  @Get('youtube/:videoId/download')
  async downloadYouTubeVideo(
    @Param('videoId') videoId: string,
    @Query('ticket') ticket: string,
    @Res() response: Response,
  ): Promise<void> {
    this.youTubePreviewService.consumeDownloadTicket(videoId, ticket);
    const download = await this.youTubePreviewService.createVideoDownloadStream(videoId);
    response.setHeader('Content-Type', download.contentType);
    response.setHeader('Content-Length', String(download.contentLength));
    response.attachment(download.fileName);

    pipeline(download.stream, response, (error) => {
      download.cleanup();
      if (error && !response.headersSent) {
        response.status(502).json({ message: 'Не удалось скачать видео YouTube' });
      } else if (error) {
        response.destroy(error);
      }
    });
  }

  @Get('vkvideo/:videoId/download')
  async downloadVKVideo(
    @Param('videoId') videoId: string,
    @Query('ticket') ticket: string,
    @Res() response: Response,
  ): Promise<void> {
    this.vkVideoService.consumeDownloadTicket(videoId, ticket);
    const download = await this.vkVideoService.createDownloadStream(videoId);
    response.setHeader('Content-Type', download.contentType ?? 'video/mp4');
    response.setHeader('Content-Length', String(download.contentLength));
    response.attachment(download.fileName);

    pipeline(download.stream, response, (error) => {
      download.cleanup();
      if (error && !response.headersSent) {
        response.status(502).json({ message: 'Не удалось скачать видео VK' });
      } else if (error) {
        response.destroy(error);
      }
    });
  }
}
