import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import type { IntentionStatus } from '../../shared/types';

@Entity('intentions')
export class buyIntention {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category!: Category | null;

  @Column()
  description!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  total_amount!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  installment_amount!: number;

  @Column('int')
  months!: number;

  @Column({ name: 'desired_start_month' })
  desired_start_month!: string;

  @Column({ default: 'pending' })
  status!: IntentionStatus;

  @CreateDateColumn()
  created_at!: Date;
}
