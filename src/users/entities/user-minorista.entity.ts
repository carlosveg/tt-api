import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';
import { User } from '.';
import { Post } from '../../posts/entities/post.entity';
import { catalogEnum } from 'src/common/enum';
import { Contrataciones } from './contratacion.entity';

@Entity('user_minorista')
export class UserMinorista {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: catalogEnum })
  ocupacion: catalogEnum;

  @Column('text')
  description: string;

  @Column('text', { nullable: false })
  latitud: string;

  @Column('text', { nullable: false })
  longitud: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idUser' })
  user: Relation<User>;

  @OneToMany(() => Post, (userPost) => userPost.user, {
    cascade: true,
  })
  posts?: Post[];

  @OneToMany(() => Contrataciones, (c) => c.usuario)
  contrataciones: Contrataciones[];
}
