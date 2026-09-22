import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  phone!: string;

  @Column()
  firstName!: string;

  @Column({ nullable: true })
  lastName!: string;

  @Column({ unique: true, nullable: true })
  username!: string;

  @Column({ nullable: true })
  about!: string;

  @Column({ nullable: true })
  avatarUrl!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}