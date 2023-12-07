import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserMinorista } from './user-minorista.entity';
import { User } from './user.entity';

@Entity('contrataciones')
export class Contrataciones {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.contrataciones, {
    onDelete: 'CASCADE',
  })
  usuario: User;

  @ManyToOne(() => UserMinorista, (um) => um.contrataciones, {
    onDelete: 'CASCADE',
    eager: true,
  })
  minorista: UserMinorista;

  @CreateDateColumn()
  fechaContratacion: Date;
}
