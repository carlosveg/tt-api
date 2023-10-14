import { Column, Entity, PrimaryColumn } from 'typeorm';

/* 
  En principio tendremos 3 tipos de usuario

  0: Usuario comun
  1: minorista
  2: admin
*/

@Entity({ name: 'users2' })
export class User {
  @PrimaryColumn('text', { nullable: false, unique: true })
  curp: string;

  @Column('text', { nullable: false })
  name: string;

  @Column('text', { nullable: false })
  apPat: string;

  @Column('text', { nullable: false })
  apMat: string;

  @Column('text', { nullable: false, unique: true })
  email: string;

  @Column('text', { nullable: false, select: false })
  password: string;

  @Column('text', { nullable: false })
  phone: string;

  @Column({ type: 'numeric', default: 0 })
  userType: number;

  @Column('bool', { default: true })
  isActive: boolean;

  /*
  A partir de aquí van las columnas que tendrán relaciones
  */
  /* @OneToOne(() => UserImage, (ui) => ui.user, { cascade: true, eager: true })
  urlImgProfile: Relation<UserImage>;

  @Column('text', { array: true, default: [] })
  opinions: string[];

  @OneToMany(() => Post, (userPost) => userPost.user, {
    cascade: true,
    eager: true,
  })
  posts?: Post[]; */

  /* @BeforeInsert()
  desmadre() {} */

  /*
    Aquí estarán las validaciones para que ciertos datos cumplan con el
    cierto formato, tales como:
      - curp
      - email
      - phone
  */
  /* @BeforeUpdate()
  desmadre() {} */
}
