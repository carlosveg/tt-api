import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_scores')
export class UserScores {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('numeric')
  score: number;

  @ManyToOne(() => User, (user) => user.calificacionesOtorgadas, {
    onDelete: 'CASCADE',
  })
  usuarioCalificador: User;

  @ManyToOne(() => User, (user) => user.calificacionesRecibidas, {
    onDelete: 'CASCADE',
  })
  usuarioCalificado: User;
}
