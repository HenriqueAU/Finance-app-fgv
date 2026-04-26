import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SalaryModule } from './salary/salary.module';
import { CategoriesModule } from './categories/categories.module';
import { CreditCardsModule } from './credit-cards/credit-cards.module';
import { ExpensesModule } from './expenses/expenses.module';
import { InstallmentsModule } from './installments/installments.module';
import { IntentionsModule } from './buy-intentions/intentions.module';
import { ProjectionModule } from './projection/projection.module';
import { User } from './users/entities/user.entity';
import { Category } from './categories/entities/category.entity';
import { CreditCard } from './credit-cards/entities/credit-card.entity';
import { Expense } from './expenses/entities/expense.entity';
import { Installment } from './installments/entities/installment.entity';
import { buyIntention } from './buy-intentions/entities/buyIntention.entity';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    SalaryModule,
    CategoriesModule,
    CreditCardsModule,
    ExpensesModule,
    InstallmentsModule,
    IntentionsModule,
    ProjectionModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DATABASE_HOST'),
        port: +config.get('DATABASE_PORT'),
        username: config.get('DATABASE_USER'),
        password: config.get('DATABASE_PASS'),
        database: config.get('DATABASE_NAME'),
        entities: [
          User,
          Category,
          CreditCard,
          Expense,
          Installment,
          buyIntention,
        ],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        synchronize: false,
        migrationsRun: false,
      }),
    }),
  ],
})
export class AppModule {}
