import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Otp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  otp: string;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column({ default: false })
  isUsed: boolean;

  @Column()
  expiresAt: Date;
}
