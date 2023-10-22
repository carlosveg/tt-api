import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Image } from './image.entity';
import { Post } from './post.entity';
import { User } from 'src/users/entities';

@Entity()
export class Opinion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { nullable: false })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  /* Relations */
  @OneToMany(() => Image, (img) => img.opinion, { cascade: true })
  images: Image[];

  @ManyToOne(() => Post, (post) => post.opinions)
  post: Post;

  /* Implementar la relacion con usuario */
  @ManyToOne(() => User, (user) => user.opinions)
  user: User;
}
