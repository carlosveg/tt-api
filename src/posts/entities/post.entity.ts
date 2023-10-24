import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserMinorista } from '../../users/entities';
import { Image } from './image.entity';
import { Opinion } from './opinion.entity';

@Entity({ name: 'posts' })
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  title: string;

  @Column('text')
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Image, (image) => image.post)
  images: Image[];

  @ManyToOne(() => UserMinorista, (user) => user.posts)
  user: UserMinorista;

  @OneToMany(() => Opinion, (op) => op.post)
  opinions: Opinion[];
}
