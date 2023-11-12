import { User } from '../../users/entities';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class FavNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  title: string;

  @Column('text')
  message: string;

  @Column('boolean', { default: false })
  isRead: boolean;

  @ManyToOne(() => User, (user) => user.favNotifications, {
    onDelete: 'CASCADE',
  })
  user: User;
}
