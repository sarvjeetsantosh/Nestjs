// user.entity.ts

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ type: 'text' })
  password: string;

  @Column({ unique: true })
  email: string;
}
