import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { Expense } from './entities/expense.entity';
import { ExpensePayment } from './entities/expense-payment.entity';
import { ExpensesCronService } from './expenses.cron';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense, ExpensePayment]),
    ScheduleModule.forRoot(),
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
