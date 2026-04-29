import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('monthly_snapshots')
export class MonthlySnapshot {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  user!: User;

  @Column()
  month!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  free_to_spend!: number;

  @CreateDateColumn()
  created_at!: Date;
}
