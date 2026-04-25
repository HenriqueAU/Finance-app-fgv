import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  user!: User;

  @Column()
  name!: string;

  @Column()
  color!: string;

  @Column({ default: false })
  is_essential!: boolean;

  @CreateDateColumn()
  created_at!: Date;
}
