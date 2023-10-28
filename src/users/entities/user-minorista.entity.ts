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
import { Post } from '../../posts/entities/post.entity';
import { catalogEnum } from 'src/common/enum';

@Entity('user_minorista')
export class UserMinorista {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: catalogEnum })
  ocupacion: catalogEnum;

  @Column('text', { nullable: false })
  latitud: string;

  @Column('text', { nullable: false })
  longitud: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'idUser' })
  user: Relation<User>;

  @OneToMany(() => Post, (userPost) => userPost.user, {
    cascade: true,
  })
  posts?: Post[];
}
