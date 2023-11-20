import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities';
import { Image } from './image.entity';
import { Post } from './post.entity';

@Entity()
export class Opinion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { nullable: false })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  /* Relations */
  @OneToMany(() => Image, (img) => img.opinion, { eager: true })
  images: Image[];

  @ManyToOne(() => Post, (post) => post.opinions, {
    onDelete: 'CASCADE',
  })
  post: Post;

  @ManyToOne(() => User, (user) => user.opinions, {
    onDelete: 'CASCADE',
    eager: true,
  })
  user: User;
}
