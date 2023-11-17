import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { ManyToOne } from 'typeorm';
import { Opinion } from './opinion.entity';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column('text')
  url: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Post, (post) => post.images, {
    onDelete: 'CASCADE',
  })
  post: Post;

  @ManyToOne(() => Opinion, (op) => op.images, {
    onDelete: 'CASCADE',
  })
  opinion: Opinion;
}
