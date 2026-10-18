import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { Readable } from 'node:stream';

const loadModule = createRequire(__filename);
const youtubedl = loadModule('youtube-dl-exec') as typeof import('youtube-dl-exec').default;

interface VKVideoInfo {
  title?: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  filesize?: number;
  resolution?: string;
  ext?: string;
  vcodec?: string;
  acodec?: string;
  url?: string;
  http_headers?: Record<string, string>;
}

interface CachedInfo {
  expiresAt: number;
  info: VKVideoInfo;
}

interface DownloadTicket {
  videoId: string;
  expiresAt: number;
}

function getContentRangeSize(value: string | null): number | undefined {
  const size = Number(value?.match(/\/(\d+)$/)?.[1]);
  return Number.isSafeInteger(size) && size > 0 ? size : undefined;
}

function getSafeFileName(title: string | undefined, videoId: string): string {
  const safeTitle = (title ?? '')
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/g, '')
    .slice(0, 120)
    .replace(/[. ]+$/g, '');
  const baseName = safeTitle || `vkvideo-${videoId}`;
  const safeBaseName = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(baseName)
    ? `_${baseName}`
    : baseName;

  return `${safeBaseName}.mp4`;
}

@Injectable()
export class VKVideoService {
  private readonly logger = new Logger(VKVideoService.name);
  private readonly infoCache = new Map<string, CachedInfo>();
  private readonly pendingInfo = new Map<string, Promise<VKVideoInfo>>();
  private readonly tickets = new Map<string, DownloadTicket>();
  private readonly infoCacheDurationMs = 90_000;
  private readonly ticketDurationMs = 2 * 60 * 1000;

  async getPreview(videoId: string) {
    this.assertVideoId(videoId);
    const info = await this.getVideoInfo(videoId);

    if (!info.title || !info.duration || !info.thumbnail) {
      throw new BadGatewayException('Не удалось получить данные видео VK');
    }

    return {
      title: info.title,
      description: info.description ?? '',
      thumbnailUrl: info.thumbnail,
      durationSeconds: info.duration,
      fileSizeBytes: info.filesize,
      qualityLabel: info.resolution?.match(/x(\d+)$/)?.[1]
        ? `${info.resolution.match(/x(\d+)$/)?.[1]}p`
        : '360p',
    };
  }

  createDownloadTicket(videoId: string): string {
    this.assertVideoId(videoId);
    const now = Date.now();
    for (const [ticket, details] of this.tickets) {
      if (details.expiresAt <= now) this.tickets.delete(ticket);
    }

    const ticket = randomUUID();
    this.tickets.set(ticket, { videoId, expiresAt: now + this.ticketDurationMs });
    return ticket;
  }

  consumeDownloadTicket(videoId: string, ticket: string): void {
    const details = this.tickets.get(ticket);
    this.tickets.delete(ticket);
    if (!details || details.videoId !== videoId || details.expiresAt <= Date.now()) {
      throw new UnauthorizedException('Ссылка на скачивание недействительна или устарела');
    }
  }

  async createDownloadStream(videoId: string): Promise<{
    stream: Readable;
    fileName: string;
    contentType: string;
    contentLength: number;
    cleanup: () => void;
  }> {
    this.assertVideoId(videoId);

    try {
      const info = await this.getVideoInfo(videoId);
      if (!info.url || info.ext !== 'mp4' || info.vcodec === 'none' || info.acodec === 'none') {
        throw new Error('VK did not return a progressive MP4');
      }

      const abortController = new AbortController();
      const response = await fetch(info.url, {
        headers: info.http_headers,
        signal: abortController.signal,
      });
      if (!response.ok || !response.body) {
        throw new Error(`VK media request failed with status ${response.status}`);
      }

      const contentLength = Number(response.headers.get('content-length')) || info.filesize;
      if (!contentLength || !Number.isSafeInteger(contentLength) || contentLength <= 0) {
        abortController.abort();
        throw new Error('VK did not provide the media file size');
      }

      return {
        stream: Readable.fromWeb(
          response.body as unknown as import('node:stream/web').ReadableStream,
        ),
        fileName: getSafeFileName(info.title, videoId),
        contentType: 'video/mp4',
        contentLength,
        cleanup: () => abortController.abort(),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`VK video download failed for ${videoId}: ${message}`);
      throw new BadGatewayException('Не удалось скачать видео VK');
    }
  }

  private assertVideoId(videoId: string): void {
    if (!/^-?\d+_\d+$/.test(videoId)) {
      throw new BadRequestException('Некорректный ID видео VK');
    }
  }

  private async getVideoInfo(videoId: string): Promise<VKVideoInfo> {
    const cached = this.infoCache.get(videoId);
    if (cached && cached.expiresAt > Date.now()) return cached.info;
    if (cached) this.infoCache.delete(videoId);

    const pending = this.pendingInfo.get(videoId);
    if (pending) return pending;

    const request = this.fetchVideoInfo(videoId)
      .then((info) => {
        if (info.url) {
          this.infoCache.set(videoId, {
            info,
            expiresAt: Date.now() + this.infoCacheDurationMs,
          });
          if (this.infoCache.size > 500) {
            const oldestVideoId = this.infoCache.keys().next().value;
            if (oldestVideoId) this.infoCache.delete(oldestVideoId);
          }
        }
        return info;
      })
      .finally(() => this.pendingInfo.delete(videoId));
    this.pendingInfo.set(videoId, request);
    return request;
  }

  private async fetchVideoInfo(videoId: string): Promise<VKVideoInfo> {
    const info = (await youtubedl(
      `https://vkvideo.ru/video${videoId}`,
      {
        format: 'url360',
        dumpSingleJson: true,
        noPlaylist: true,
        noWarnings: true,
        noProgress: true,
        quiet: true,
      },
    )) as unknown as VKVideoInfo;

    if ((!info.filesize || info.filesize <= 0) && info.url) {
      try {
        const response = await fetch(info.url, {
          headers: { ...info.http_headers, Range: 'bytes=0-0' },
          signal: AbortSignal.timeout(8_000),
        });
        const size = response.status === 206
          ? getContentRangeSize(response.headers.get('content-range'))
          : undefined;
        await response.body?.cancel();
        if (size) info.filesize = size;
      } catch {
        return info;
      }
    }

    return info;
  }
}