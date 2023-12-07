import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ValidRoles } from '../../auth/interfaces/valid-roles';
import { Opinion } from '../../posts/entities/opinion.entity';
import { UserMinorista } from './user-minorista.entity';
import { UserScores } from './user-score.entity';
import { FavNotification, Solicitudes } from '../../notifications/entities';
import { Contrataciones } from './contratacion.entity';

/* 
  En principio tendremos 3 tipos de usuario

  0: Usuario comun
  1: minorista
  2: admin
*/

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    nullable: false,
    unique: true,
    select: false,
  })
  curp: string;

  @Column('text', { nullable: false })
  fullName: string;

  @Column('text', { nullable: false, unique: true })
  email: string;

  @Column('text', { nullable: false, select: false })
  password: string;

  @Column('text', { nullable: false })
  phone: string;

  @Column({
    type: 'enum',
    enum: ValidRoles,
    default: ValidRoles.USER,
    nullable: false,
  })
  userType: ValidRoles;

  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('text', {
    nullable: false,
    default: 'https://files-tt.s3.amazonaws.com/nobody.jpg',
  })
  urlImgProfile: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /*
  A partir de aquí van las columnas que tendrán relaciones
  */
  @OneToOne(() => UserMinorista, (um) => um.user, {
    cascade: true,
    nullable: true,
  })
  minorista: UserMinorista;

  /* 
    Aquí se va a almacenar el cálculo del promedio de las calificaciones recibidas
   */
  @Column('numeric', { default: 0 })
  score: number;

  @OneToMany(() => UserScores, (score) => score.usuarioCalificador, {
    cascade: true,
  })
  calificacionesOtorgadas: UserScores[];

  @OneToMany(() => UserScores, (score) => score.usuarioCalificado, {
    cascade: true,
  })
  calificacionesRecibidas: UserScores[];

  @OneToMany(() => Opinion, (op) => op.user, { cascade: true })
  opinions: string[];

  /* 
    Relaciones para manejar el proceso de los favoritos
   */
  @ManyToMany(() => User, (user) => user.favoritedBy, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  favorites: User[];

  @ManyToMany(() => User, (user) => user.favorites, {
    onDelete: 'CASCADE',
  })
  favoritedBy: User[];

  @OneToMany(() => Solicitudes, (sol) => sol.user, { cascade: true })
  solicitudes: Solicitudes[];

  /* implementar la relacion con opinions */
  @OneToMany(() => Opinion, (op) => op.user, { cascade: true })
  favNotifications: FavNotification[];

  @OneToMany(() => Contrataciones, (c) => c.usuario, { eager: true })
  contrataciones: Contrataciones[];
}
