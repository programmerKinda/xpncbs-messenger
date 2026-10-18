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

export interface YouTubePreviewMetadata {
  title: string;
  description: string;
  thumbnailUrl?: string;
  durationSeconds: number;
  fileSizeBytes?: number;
  qualityLabel?: string;
}

type JsonObject = Record<string, unknown>;

type CachedPreview = {
  expiresAt: number;
  metadata: YouTubePreviewMetadata;
};

type DownloadInfo = {
  title?: string;
  url?: string;
  ext?: string;
  filesize?: number;
  resolution?: string;
  vcodec?: string;
  acodec?: string;
  http_headers?: Record<string, string>;
};

type DownloadTicket = {
  videoId: string;
  expiresAt: number;
};

type CachedDownloadInfo = {
  info: DownloadInfo;
  expiresAt: number;
};

const DOWNLOAD_FORMAT =
  'best[height<=360]';

function readEmbeddedObject(source: string, marker: string): JsonObject | null {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) return null;

  const objectStart = source.indexOf('{', markerIndex + marker.length);
  if (objectStart < 0) return null;

  let depth = 0;
  let inString = false;
  let isEscaped = false;

  for (let index = objectStart; index < source.length; index += 1) {
    const character = source[index];

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
      } else if (character === '\\') {
        isEscaped = true;
      } else if (character === '"') {
        inString = false;
      }
      continue;
    }

    if (character === '"') {
      inString = true;
    } else if (character === '{') {
      depth += 1;
    } else if (character === '}') {
      depth -= 1;
      if (depth === 0) {
        try {
          const parsed: unknown = JSON.parse(source.slice(objectStart, index + 1));
          return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
            ? (parsed as JsonObject)
            : null;
        } catch {
          return null;
        }
      }
    }
  }

  return null;
}

function getString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function getContentRangeSize(value: string | null): number | undefined {
  const size = Number(value?.match(/\/(\d+)$/)?.[1]);
  return Number.isSafeInteger(size) && size > 0 ? size : undefined;
}

function getSafeVideoFileName(title: string | undefined, videoId: string): string {
  const safeTitle = (title ?? '')
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/g, '')
    .slice(0, 120)
    .replace(/[. ]+$/g, '');
  const baseName = safeTitle || `youtube-${videoId}`;
  const safeBaseName = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(baseName)
    ? `_${baseName}`
    : baseName;

  return `${safeBaseName}.mp4`;
}

function getPreferredFormat(streamingData: JsonObject): {
  fileSizeBytes?: number;
  qualityLabel?: string;
} {
  const formats = Array.isArray(streamingData.formats) ? streamingData.formats : [];
  const candidates = formats
    .filter((format): format is JsonObject => Boolean(format) && typeof format === 'object')
    .map((format) => ({
      fileSizeBytes: Number(format.contentLength),
      qualityLabel: getString(format.qualityLabel),
    }))
    .filter((format) => Number.isSafeInteger(format.fileSizeBytes) && format.fileSizeBytes > 0);

  const preferred =
    candidates.find((format) => format.qualityLabel?.startsWith('720p')) ??
    candidates.find((format) => format.qualityLabel?.startsWith('480p')) ??
    candidates.find((format) => format.qualityLabel?.startsWith('360p')) ??
    candidates.sort((first, second) => {
      const firstHeight = Number(first.qualityLabel?.match(/(\d+)p/)?.[1] ?? 0);
      const secondHeight = Number(second.qualityLabel?.match(/(\d+)p/)?.[1] ?? 0);
      return secondHeight - firstHeight;
    })[0];

  return preferred
    ? {
        fileSizeBytes: preferred.fileSizeBytes,
        qualityLabel: preferred.qualityLabel,
      }
    : {};
}

@Injectable()
export class YouTubePreviewService {
  private readonly logger = new Logger(YouTubePreviewService.name);
  private readonly cache = new Map<string, CachedPreview>();
  private readonly downloadInfoCache = new Map<string, CachedDownloadInfo>();
  private readonly downloadInfoRequests = new Map<string, Promise<DownloadInfo>>();
  private readonly downloadTickets = new Map<string, DownloadTicket>();
  private readonly cacheDurationMs = 6 * 60 * 60 * 1000;
  private readonly downloadInfoCacheDurationMs = 90 * 1000;
  private readonly downloadTicketDurationMs = 2 * 60 * 1000;

  async getPreview(videoId: string): Promise<YouTubePreviewMetadata> {
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      throw new BadRequestException('Некорректный ID видео YouTube');
    }

    const cached = this.cache.get(videoId);
    if (
      cached &&
      cached.expiresAt > Date.now() &&
      cached.metadata.fileSizeBytes &&
      cached.metadata.qualityLabel === '360p'
    ) {
      void this.getProgressiveVideoInfo(videoId).catch(() => undefined);
      return cached.metadata;
    }

    try {
      const downloadInfoRequest = this.getProgressiveVideoInfo(videoId).catch(() => null);
      const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(10_000),
      });

      if (!response.ok) throw new Error(`YouTube returned ${response.status}`);

      const html = await response.text();
      const videoDetails = readEmbeddedObject(html, '"videoDetails"');
      const title = getString(videoDetails?.title);
      const durationSeconds = Number(videoDetails?.lengthSeconds);

      if (!title || !Number.isFinite(durationSeconds) || durationSeconds <= 0) {
        throw new Error('YouTube metadata is unavailable');
      }

      const thumbnails = videoDetails?.thumbnail as JsonObject | undefined;
      const thumbnailList = Array.isArray(thumbnails?.thumbnails)
        ? thumbnails.thumbnails
        : [];
      const thumbnailUrl = thumbnailList
        .map((thumbnail) =>
          thumbnail && typeof thumbnail === 'object'
            ? getString((thumbnail as JsonObject).url)
            : undefined,
        )
        .filter((url): url is string => Boolean(url))
        .at(-1);
      const streamingData = readEmbeddedObject(html, '"streamingData"');
      const format = streamingData ? getPreferredFormat(streamingData) : {};
      const downloadInfo = await downloadInfoRequest;
      const resolutionHeight = downloadInfo?.resolution?.match(/x(\d+)$/)?.[1];
      const metadata: YouTubePreviewMetadata = {
        title,
        description: getString(videoDetails?.shortDescription) ?? '',
        thumbnailUrl,
        durationSeconds,
        ...format,
        fileSizeBytes: downloadInfo?.filesize ?? format.fileSizeBytes,
        qualityLabel: resolutionHeight
          ? `${resolutionHeight}p`
          : format.qualityLabel,
      };

      this.cache.set(videoId, {
        expiresAt: Date.now() + this.cacheDurationMs,
        metadata,
      });
      if (this.cache.size > 500) {
        const oldestVideoId = this.cache.keys().next().value;
        if (oldestVideoId) this.cache.delete(oldestVideoId);
      }

      return metadata;
    } catch {
      throw new BadGatewayException('Не удалось получить метаданные видео YouTube');
    }
  }

  createDownloadTicket(videoId: string): string {
    this.assertVideoId(videoId);

    const now = Date.now();
    for (const [ticket, details] of this.downloadTickets) {
      if (details.expiresAt <= now) this.downloadTickets.delete(ticket);
    }

    const ticket = randomUUID();
    this.downloadTickets.set(ticket, {
      videoId,
      expiresAt: now + this.downloadTicketDurationMs,
    });
    return ticket;
  }

  consumeDownloadTicket(videoId: string, ticket: string): void {
    const details = this.downloadTickets.get(ticket);
    this.downloadTickets.delete(ticket);
    if (!details || details.videoId !== videoId || details.expiresAt <= Date.now()) {
      throw new UnauthorizedException('Ссылка на скачивание недействительна или устарела');
    }
  }

  async createVideoDownloadStream(videoId: string): Promise<{
    stream: Readable;
    fileName: string;
    contentType: string;
    contentLength: number;
    cleanup: () => void;
  }> {
    this.assertVideoId(videoId);

    try {
      const videoInfo = await this.getProgressiveVideoInfo(videoId);
      if (
        !videoInfo.url ||
        videoInfo.ext !== 'mp4' ||
        videoInfo.vcodec === 'none' ||
        videoInfo.acodec === 'none'
      ) {
        throw new Error('yt-dlp did not return a progressive MP4');
      }

      const abortController = new AbortController();
      const upstream = await fetch(videoInfo.url, {
        headers: videoInfo.http_headers,
        signal: abortController.signal,
      });
      if (!upstream.ok || !upstream.body) {
        throw new Error(`YouTube media request failed with status ${upstream.status}`);
      }

      const upstreamLength = Number(upstream.headers.get('content-length'));
      const contentLength = Number.isSafeInteger(upstreamLength) && upstreamLength > 0
        ? upstreamLength
        : videoInfo.filesize;
      if (!contentLength || !Number.isSafeInteger(contentLength) || contentLength <= 0) {
        abortController.abort();
        throw new Error('YouTube did not provide the media file size');
      }

      return {
        stream: Readable.fromWeb(
          upstream.body as unknown as import('node:stream/web').ReadableStream,
        ),
        fileName: getSafeVideoFileName(videoInfo.title, videoId),
        contentType: 'video/mp4',
        contentLength,
        cleanup: () => abortController.abort(),
      };
    } catch (error) {
      const details =
        error && typeof error === 'object' && 'stderr' in error
          ? String(error.stderr)
          : error instanceof Error
            ? error.message
            : String(error);
      const failureLine =
        details
          .split(/\r?\n/)
          .reverse()
          .find((line) => /^ERROR:/i.test(line.trim())) ?? details;
      const reason = failureLine
        .replace(/^\s*ERROR:\s*/i, '')
        .replace(/https?:\/\/\S+/g, '[URL]')
        .replace(/[A-Za-z]:\\[^\s]+/g, '[path]')
        .slice(0, 240);
      this.logger.error(`yt-dlp failed for ${videoId}: ${reason}`);
      throw new BadGatewayException({
        message: 'Не удалось скачать видео YouTube',
        reason,
      });
    }
  }

  private assertVideoId(videoId: string): void {
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      throw new BadRequestException('Некорректный ID видео YouTube');
    }
  }

  private async getProgressiveVideoInfo(videoId: string): Promise<DownloadInfo> {
    const cached = this.downloadInfoCache.get(videoId);
    if (cached && cached.expiresAt > Date.now()) return cached.info;
    if (cached) this.downloadInfoCache.delete(videoId);

    const pending = this.downloadInfoRequests.get(videoId);
    if (pending) return pending;

    const request = this.fetchProgressiveVideoInfo(videoId)
      .then((info) => {
        if (info.url) {
          this.downloadInfoCache.set(videoId, {
            info,
            expiresAt: Date.now() + this.downloadInfoCacheDurationMs,
          });
          if (this.downloadInfoCache.size > 500) {
            const oldestVideoId = this.downloadInfoCache.keys().next().value;
            if (oldestVideoId) this.downloadInfoCache.delete(oldestVideoId);
          }
        }
        return info;
      })
      .finally(() => this.downloadInfoRequests.delete(videoId));
    this.downloadInfoRequests.set(videoId, request);
    return request;
  }

  private async fetchProgressiveVideoInfo(videoId: string): Promise<DownloadInfo> {
    const videoInfo = (await youtubedl(
      `https://www.youtube.com/watch?v=${videoId}`,
      {
        format: DOWNLOAD_FORMAT,
        extractorArgs: 'youtube:player_client=android',
        dumpSingleJson: true,
        noPlaylist: true,
        noWarnings: true,
        noProgress: true,
        quiet: true,
      },
    )) as unknown as DownloadInfo;

    if ((!videoInfo.filesize || videoInfo.filesize <= 0) && videoInfo.url) {
      try {
        const response = await fetch(videoInfo.url, {
          headers: { ...videoInfo.http_headers, Range: 'bytes=0-0' },
          signal: AbortSignal.timeout(8_000),
        });
        const rangeSize =
          response.status === 206
            ? getContentRangeSize(response.headers.get('content-range'))
            : undefined;
        await response.body?.cancel();
        if (rangeSize) videoInfo.filesize = rangeSize;
      } catch {
        return videoInfo;
      }
    }

    return videoInfo;
  }
}