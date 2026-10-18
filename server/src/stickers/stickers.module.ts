import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../auth/entities/user.entity';
import { StickerPack } from './entities/sticker-pack.entity';
import { Sticker } from './entities/sticker.entity';
import { StickersController } from './stickers.controller';
import { StickerService } from './sticker.service';

@Module({
  imports: [TypeOrmModule.forFeature([StickerPack, Sticker, User])],
  controllers: [StickersController],
  providers: [StickerService],
  exports: [StickerService],
})
export class StickersModule {}