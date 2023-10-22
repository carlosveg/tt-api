import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_scores')
export class UserScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('numeric')
  score: number;

  @ManyToOne(() => User, (user) => user.score)
  userOrigen: User;
}
