import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from '@jest/globals';
import { VKVideoService } from './vkvideo.service';

describe('VKVideoService', () => {
  it('issues single-use tickets for VK Video IDs', () => {
    const service = new VKVideoService();
    const ticket = service.createDownloadTicket('-56169357_456266533');

    expect(service.consumeDownloadTicket('-56169357_456266533', ticket)).toBeUndefined();
    expect(() => service.consumeDownloadTicket('-56169357_456266533', ticket)).toThrow();
  });

  it('rejects IDs that do not match VK Video format', () => {
    const service = new VKVideoService();

    expect(() => service.createDownloadTicket('not-a-video')).toThrow(BadRequestException);
  });
});