import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Repository } from 'typeorm';

import { User } from '../auth/entities/user.entity';
import { StickerPack } from './entities/sticker-pack.entity';
import { Sticker } from './entities/sticker.entity';

@Injectable()
export class StickerService implements OnModuleInit {
  constructor(
    @InjectRepository(StickerPack)
    private readonly packRepository: Repository<StickerPack>,
    @InjectRepository(Sticker)
    private readonly stickerRepository: Repository<Sticker>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    const assetDirectories = [
      join(process.cwd(), 'stickers'),
      join(process.cwd(), 'server', 'stickers'),
    ];
    const assetDirectory = assetDirectories.find(existsSync);
    if (!assetDirectory) return;

    const pack =
      (await this.packRepository.findOne({ where: { isDefault: true } })) ??
      (await this.packRepository.save(
        this.packRepository.create({ name: 'Стикеры', isDefault: true }),
      ));
    const existingStickers = await this.stickerRepository.find({ where: { packId: pack.id } });
    const existingFileNames = new Set(existingStickers.map((sticker) => sticker.fileName));
    const fileNames = readdirSync(assetDirectory)
      .filter((fileName) => /^sticker_\d+\.webp$/i.test(fileName))
      .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));

    for (const fileName of fileNames) {
      if (existingFileNames.has(fileName)) continue;
      const number = fileName.match(/\d+/)?.[0] ?? '';
      await this.stickerRepository.save(
        this.stickerRepository.create({
          packId: pack.id,
          fileName,
          title: `Стикер ${number}`,
        }),
      );
    }

    const users = await this.userRepository.find({ relations: { stickerPacks: true } });
    for (const user of users) {
      if (user.stickerPacks.some((userPack) => userPack.id === pack.id)) continue;
      await this.userRepository
        .createQueryBuilder()
        .relation(User, 'stickerPacks')
        .of(user.id)
        .add(pack.id);
    }
  }

  async findForUser(stickerId: string, userId: string): Promise<Sticker> {
    const sticker = await this.stickerRepository
      .createQueryBuilder('sticker')
      .innerJoin('sticker.pack', 'pack')
      .innerJoin('pack.users', 'user', 'user.id = :userId', { userId })
      .where('sticker.id = :stickerId', { stickerId })
      .getOne();
    if (!sticker) throw new NotFoundException('Стикер не найден');
    return sticker;
  }

  async findPacksForUser(userId: string) {
    const packs = await this.packRepository
      .createQueryBuilder('pack')
      .innerJoin('pack.users', 'user', 'user.id = :userId', { userId })
      .leftJoinAndSelect('pack.stickers', 'sticker')
      .orderBy('pack.name', 'ASC')
      .addOrderBy('sticker.fileName', 'ASC')
      .getMany();

    return packs.map((pack) => ({
      id: pack.id,
      name: pack.name,
      stickers: pack.stickers.map((sticker) => ({
        id: sticker.id,
        title: sticker.title,
        url: `/api/stickers/${encodeURIComponent(sticker.fileName)}`,
      })),
    }));
  }
}