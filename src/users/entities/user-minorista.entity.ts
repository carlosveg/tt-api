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

@Entity('user_minorista')
export class UserMinorista {
  @PrimaryColumn('uuid')
  id: string;

  @Column('text')
  ocupacion: string;

  /* @Column({
    type: 'enum',
    enum: UserTypeEnum,
    nullable: false,
    default: UserTypeEnum.USER,
  })
  type: UserTypeEnum; */

  @Column('text')
  direccion_negocio: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'idUser' })
  user: Relation<User>;

  @OneToMany(() => Post, (userPost) => userPost.user, {
    cascade: true,
  })
  posts?: Post[];
}
