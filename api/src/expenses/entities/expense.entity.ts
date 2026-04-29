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

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Category, { nullable: true })
  category!: Category | null;

  @ManyToOne(() => CreditCard, { nullable: true })
  credit_card!: CreditCard | null;

  @Column()
  description!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;

  @Column('int', { nullable: true })
  due_day!: number | null;

  @Column({ default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;
}
