import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { YouTubePreviewService } from './youtube-preview.service';

describe('YouTubePreviewService', () => {
  let service: YouTubePreviewService;
  const originalFetch = global.fetch;

  beforeEach(() => {
    service = new YouTubePreviewService();
    jest
      .spyOn(
        service as unknown as {
          getProgressiveVideoInfo: (videoId: string) => Promise<unknown>;
        },
        'getProgressiveVideoInfo',
      )
      .mockResolvedValue({ filesize: 98796002, resolution: '640x360' });
    global.fetch = jest.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      text: async () =>
        '"videoDetails":{"title":"Example video","shortDescription":"Video description","lengthSeconds":"2184","thumbnail":{"thumbnails":[{"url":"https://img.youtube.com/thumb.jpg"}]}} "streamingData":{"formats":[{"qualityLabel":"720p","contentLength":"297481216"}]}',
    } as Response);
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('returns video details and the selected format size', async () => {
    await expect(service.getPreview('KW-svyIZVE0')).resolves.toEqual({
      title: 'Example video',
      description: 'Video description',
      thumbnailUrl: 'https://img.youtube.com/thumb.jpg',
      durationSeconds: 2184,
      fileSizeBytes: 98796002,
      qualityLabel: '360p',
    });
  });

  it('refreshes cached metadata without the exact 360p size', async () => {
    const cache = service as unknown as {
      cache: Map<string, { expiresAt: number; metadata: Record<string, unknown> }>;
    };
    cache.cache.set('KW-svyIZVE0', {
      expiresAt: Date.now() + 60_000,
      metadata: {
        title: 'Stale title',
        description: '',
        durationSeconds: 1,
        fileSizeBytes: 297481216,
        qualityLabel: '720p',
      },
    });

    await expect(service.getPreview('KW-svyIZVE0')).resolves.toMatchObject({
      title: 'Example video',
      fileSizeBytes: 98796002,
      qualityLabel: '360p',
    });
  });

  it('rejects values that are not YouTube video IDs', async () => {
    await expect(service.getPreview('https://example.com')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('issues single-use download tickets for a video', () => {
    const ticket = service.createDownloadTicket('kW-svyIZVE0');

    expect(service.consumeDownloadTicket('kW-svyIZVE0', ticket)).toBeUndefined();
    expect(() => service.consumeDownloadTicket('kW-svyIZVE0', ticket)).toThrow();
  });
});