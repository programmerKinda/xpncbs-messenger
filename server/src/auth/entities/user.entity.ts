import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StickerPack } from '../../stickers/entities/sticker-pack.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  phone!: string;

  @Column()
  firstName!: string;

  @Column({ type: 'varchar', nullable: true })
  lastName!: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true })
  username!: string | null;

  @Column({ type: 'text', nullable: true })
  about!: string | null;

  @Column({ type: 'varchar', nullable: true })
  avatarUrl!: string | null;

  @ManyToMany(() => StickerPack, (stickerPack) => stickerPack.users)
  @JoinTable({
    name: 'user_sticker_packs',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'stickerPackId', referencedColumnName: 'id' },
  })
  stickerPacks!: StickerPack[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
