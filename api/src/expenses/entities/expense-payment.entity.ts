import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Expense } from './expense.entity';

@Entity('expense_payments')
export class ExpensePayment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Expense)
  expense!: Expense;

  @ManyToOne(() => User)
  user!: User;

  @Column()
  month!: string;

  @Column({ type: 'timestamp', nullable: true })
  paid_at!: Date | null;

  @CreateDateColumn()
  created_at!: Date;
}
