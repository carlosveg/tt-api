import { catalogEnum } from 'src/common/enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities';

/* 
La columna type nos sirve para saber de qué tipo de solicitud hablado
  0: minorista
  1: reactivación
 */

@Entity()
export class Solicitudes {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('numeric', { default: 0 })
  type: number;

  @Column('text')
  title: string;

  @Column('text')
  message: string;

  @Column('boolean', { default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.solicitudes, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({ type: 'enum', enum: catalogEnum, nullable: true })
  ocupacion: catalogEnum;

  @Column('text', { nullable: true })
  description: string;

  @Column('text', { nullable: true })
  latitud: string;

  @Column('text', { nullable: true })
  longitud: string;
}
