import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password_hash!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  emergency_reserve!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  salary!: number;

  @Column('int', { nullable: true })
  payday!: number | null;

  @CreateDateColumn()
  created_at!: Date;
}
