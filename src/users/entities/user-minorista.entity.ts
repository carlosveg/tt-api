import { Post } from 'src/posts/entities/post.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';
import { User } from '.';

@Entity('user_minorista')
export class UserMinorista {
  @PrimaryColumn()
  id: string;

  @Column('text')
  ocupacion: string;

  @Column('text')
  direccion_negocio: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'curp' })
  user: Relation<User>;

  @OneToMany(() => Post, (userPost) => userPost.user, {
    cascade: true,
    // eager: true,
  })
  posts?: Post[];
}
