import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { User } from './';

@Entity('user_images')
export class UserImage {
  @PrimaryGeneratedColumn()
  id: string;

  @Column('text')
  url: string;

  @OneToOne(() => User, (user) => user.curp, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'curp' })
  user: Relation<User>;
}
