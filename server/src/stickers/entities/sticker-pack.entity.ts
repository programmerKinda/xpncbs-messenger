import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../auth/entities/user.entity';
import { Sticker } from './sticker.entity';

@Entity('sticker_packs')
export class StickerPack {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ default: false })
  isDefault!: boolean;

  @ManyToMany(() => User, (user) => user.stickerPacks)
  users!: User[];

  @OneToMany(() => Sticker, (sticker) => sticker.pack)
  stickers!: Sticker[];
}