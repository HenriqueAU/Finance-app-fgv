import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
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
}
