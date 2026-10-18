import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StickerService } from './sticker.service';

@Controller('stickers')
@UseGuards(JwtAuthGuard)
export class StickersController {
  constructor(private readonly stickerService: StickerService) {}

  @Get('packs')
  findPacksForUser(@Req() request: { user: { id: string } }) {
    return this.stickerService.findPacksForUser(request.user.id);
  }
}