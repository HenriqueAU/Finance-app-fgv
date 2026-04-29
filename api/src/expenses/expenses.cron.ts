import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { ExpensePayment } from './entities/expense-payment.entity';

@Injectable()
export class ExpensesCronService {
  private readonly logger = new Logger(ExpensesCronService.name);

  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(ExpensePayment)
    private readonly expensePaymentRepository: Repository<ExpensePayment>,
  ) {}

  @Cron('0 0 1 * *') 
  async handleMonthlyPayments() {
    this.logger.log('Iniciando a rotina automática de virada de mês para contas fixas...');
    
    const currentMonth = new Date().toISOString().slice(0, 7);

    const activeExpenses = await this.expenseRepository.find({
      where: { is_active: true }
    });

    let createdCount = 0;

    for (const expense of activeExpenses) {
      const existingPayment = await this.expensePaymentRepository.findOne({
        where: { expense: { id: expense.id }, month: currentMonth }
      });

      if (!existingPayment) {
        const payment = this.expensePaymentRepository.create({
          expense: { id: expense.id },
          month: currentMonth,
          paid_at: null,
        });
        
        await this.expensePaymentRepository.save(payment);
        createdCount++;
      }
    }

    this.logger.log(`Rotina concluída: ${createdCount} pagamentos pendentes criados para ${currentMonth}.`);
  }
}