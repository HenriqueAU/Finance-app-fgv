import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpensePayment } from './entities/expense-payment.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(ExpensePayment)
    private readonly expensePaymentRepository: Repository<ExpensePayment>,
  ) {}

  async create(userId: string, dto: CreateExpenseDto) {
    const expense = this.expenseRepository.create({
      ...dto,
      user: { id: userId },
      category: dto.categoryId ? { id: dto.categoryId } : null,
      credit_card: dto.creditCardId ? { id: dto.creditCardId } : null,
    });
    return await this.expenseRepository.save(expense);
  }

  async findAll(userId: string) {
    return await this.expenseRepository.find({
      where: { user: { id: userId } },
      relations: ['category', 'credit_card'],
    });
  }

  async findActive(userId: string) {
    return await this.expenseRepository.find({
      where: { user: { id: userId }, is_active: true },
      relations: ['category', 'credit_card'],
    });
  }

  async update(id: string, userId: string, dto: UpdateExpenseDto) {
    const expense = await this.expenseRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!expense) throw new NotFoundException('Despesa não encontrada');

    const { categoryId, creditCardId, ...rest } = dto;

    Object.assign(expense, {
      ...rest,
      category: categoryId ? { id: categoryId } : expense.category,
      credit_card: creditCardId ? { id: creditCardId } : expense.credit_card,
    });

    return await this.expenseRepository.save(expense);
  }

  async toggle(id: string, userId: string) {
    const expense = await this.expenseRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!expense) throw new NotFoundException('Despesa não encontrada');

    expense.is_active = !expense.is_active;
    return await this.expenseRepository.save(expense);
  }

  async remove(id: string, userId: string) {
    const expense = await this.expenseRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!expense) throw new NotFoundException('Despesa não encontrada');

    await this.expenseRepository.delete(id);
    return { message: 'Despesa removida com sucesso' };
  }

  async getPaymentsByMonth(userId: string, month: string) {
    return this.expensePaymentRepository.find({
      where: { user: { id: userId }, month },
      relations: ['expense'],
    });
  }

  async pay(expenseId: string, userId: string, month: string) {
    let payment = await this.expensePaymentRepository.findOne({
      where: { expense: { id: expenseId }, user: { id: userId }, month },
    });

    if (!payment) {
      payment = this.expensePaymentRepository.create({
        expense: { id: expenseId },
        user: { id: userId },
        month,
        paid_at: null,
      });
    }

    payment.paid_at = new Date();
    return this.expensePaymentRepository.save(payment);
  }

  async unpay(expenseId: string, userId: string, month: string) {
    const payment = await this.expensePaymentRepository.findOne({
      where: { expense: { id: expenseId }, user: { id: userId }, month },
    });

    if (!payment) throw new NotFoundException('Pagamento não encontrado');

    payment.paid_at = null;
    return this.expensePaymentRepository.save(payment);
  }

  @Cron('0 0 1 * *')
  async handleMonthTurn() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const activeExpenses = await this.expenseRepository.find({
      where: { is_active: true },
      relations: ['user'],
    });

    for (const expense of activeExpenses) {
      const existingPayment = await this.expensePaymentRepository.findOne({
        where: { 
          expense: { id: expense.id }, 
          user: { id: expense.user.id },
          month: currentMonth 
        },
      });

      if (!existingPayment) {
        const payment = this.expensePaymentRepository.create({
          expense: { id: expense.id },
          user: { id: expense.user.id },
          month: currentMonth,
          paid_at: null,
        });
        await this.expensePaymentRepository.save(payment);
      }
    }
  }
}
