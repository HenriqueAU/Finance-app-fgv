import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('credit_cards')
export class CreditCard {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  user!: User;

  @Column()
  name!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  limit!: number;

  @Column('int')
  closing_day!: number;

  @Column('int')
  payment_due_day!: number;

  @CreateDateColumn()
  created_at!: Date;
}
