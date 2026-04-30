import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import type { IntentionStatus } from '../../shared/types';

@Entity('intentions')
export class BuyIntention {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Category, { nullable: true })
  category!: Category | null;

  @Column()
  description!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  installment_amount!: number;

  @Column('int')
  months!: number;

  @Column({ name: 'desired_start_month', type: 'varchar' })
  desired_start_month!: string;

  @Column({ default: 'pendente' })
  status!: IntentionStatus;

  @CreateDateColumn()
  created_at!: Date;
}
