import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('categories')
@Unique(['name', 'user'])
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
