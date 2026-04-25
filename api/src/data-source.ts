import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const dbPort = process.env.DATABASE_PORT;

if (!dbPort) {
  throw new Error('DATABASE_PORT não definido');
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: +dbPort,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE_NAME,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});
