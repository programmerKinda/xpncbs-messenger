import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { StickerPack } from './sticker-pack.entity';

@Entity('stickers')
@Index('IDX_stickers_pack_file', ['packId', 'fileName'], { unique: true })
export class Sticker {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  packId!: string;

  @ManyToOne(() => StickerPack, (pack) => pack.stickers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'packId' })
  pack!: StickerPack;

  @Column()
  fileName!: string;

  @Column()
  title!: string;
}