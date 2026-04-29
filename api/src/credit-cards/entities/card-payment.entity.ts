import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CreditCard } from './credit-card.entity';

@Entity('card_payments')
export class CardPayment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => CreditCard)
  credit_card!: CreditCard;

  @Column()
  month!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount_paid!: number;

  @CreateDateColumn()
  created_at!: Date;
}
