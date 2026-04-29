import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { CreditCard } from '../../credit-cards/entities/credit-card.entity';

@Entity('installments')
export class Installment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Category, { nullable: true })
  category?: Category;

  @ManyToOne(() => CreditCard, { nullable: true })
  credit_card!: CreditCard | null;

  @Column()
  description!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  installment_amount!: number;

  @Column('int')
  total_months!: number;

  @Column()
  start_month!: string;

  @CreateDateColumn()
  created_at!: Date;
}
