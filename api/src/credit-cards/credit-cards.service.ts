import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditCard } from './entities/credit-card.entity';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';
import { CardPayment } from './entities/card-payment.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { Installment } from '../installments/entities/installment.entity';
import { CreateCardPaymentDto } from './dto/create-card-payment.dto';
import { CardUsage } from '../shared/types';

@Injectable()
export class CreditCardsService {
  constructor(
    @InjectRepository(CreditCard)
    private readonly creditCardRepository: Repository<CreditCard>,
    @InjectRepository(CardPayment)
    private readonly cardPaymentRepository: Repository<CardPayment>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(Installment)
    private readonly installmentRepository: Repository<Installment>,
  ) {}

  async create(userId: string, dto: CreateCreditCardDto) {
    const creditCard = this.creditCardRepository.create({
      ...dto,
      user: { id: userId },
    });
    return await this.creditCardRepository.save(creditCard);
  }

  async findAll(userId: string) {
    return await this.creditCardRepository.find({
      where: { user: { id: userId } },
    });
  }

  async update(id: string, userId: string, dto: UpdateCreditCardDto) {
    const creditCard = await this.creditCardRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!creditCard) throw new NotFoundException('Cartão não encontrado');

    Object.assign(creditCard, dto);
    return await this.creditCardRepository.save(creditCard);
  }

  async remove(id: string, userId: string) {
    const creditCard = await this.creditCardRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!creditCard) throw new NotFoundException('Cartão não encontrado');

    try {
      await this.creditCardRepository.delete(id);
      return { message: 'Cartão removido com sucesso' };
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === '23503'
      ) {
        throw new Error(
          'Não é possível remover este cartão pois ele está vinculado a despesas ou parcelamentos.',
        );
      }
      throw error;
    }
  }
  async getUsage(
    creditCardId: string,
    userId: string,
    month: string,
    depth = 0,
  ): Promise<CardUsage> {
    const creditCard = await this.creditCardRepository.findOne({
      where: { id: creditCardId, user: { id: userId } },
    });
    if (!creditCard) throw new NotFoundException('Cartão não encontrado');

    const expenses = await this.expenseRepository.find({
      where: {
        credit_card: { id: creditCardId },
        user: { id: userId },
        is_active: true,
      },
    });

    const installments = await this.installmentRepository.find({
      where: { credit_card: { id: creditCardId }, user: { id: userId } },
    });

    const [year, m] = month.split('-').map(Number);

    const activeInstallments = installments.filter((i) => {
      const [sy, sm] = i.start_month.split('-').map(Number);
      const startDate = new Date(sy, sm - 1);
      const endDate = new Date(sy, sm - 1 + i.total_months - 1);
      const target = new Date(year, m - 1);
      return startDate <= target && target <= endDate;
    });

    const committed =
      expenses.reduce((sum, e) => sum + Number(e.amount), 0) +
      activeInstallments.reduce(
        (sum, i) => sum + Number(i.installment_amount),
        0,
      );

    const previousMonth =
      m === 1 ? `${year - 1}-12` : `${year}-${String(m - 1).padStart(2, '0')}`;

    let previousDebt = 0;
    if (previousMonth && depth === 0) {
      const previousPayment = await this.cardPaymentRepository.findOne({
        where: {
          credit_card: { id: creditCardId },
          user: { id: userId },
          month: previousMonth,
        },
      });

      if (previousPayment) {
        const previousUsage = await this.getUsage(
          creditCardId,
          userId,
          previousMonth,
          1,
        );
        previousDebt = Math.max(
          0,
          previousUsage.committed - Number(previousPayment.amount_paid),
        );
      }
    }

    const totalOwed = committed + previousDebt;
    const available = Number(creditCard.limit) - totalOwed;

    return {
      creditCardId,
      month,
      limit: Number(creditCard.limit),
      committed,
      previousDebt,
      totalOwed,
      available,
    };
  }

  async registerPayment(
    creditCardId: string,
    userId: string,
    dto: CreateCardPaymentDto,
  ) {
    const creditCard = await this.creditCardRepository.findOne({
      where: { id: creditCardId, user: { id: userId } },
    });
    if (!creditCard) throw new NotFoundException('Cartão não encontrado');

    let payment = await this.cardPaymentRepository.findOne({
      where: {
        credit_card: { id: creditCardId },
        user: { id: userId },
        month: dto.month,
      },
    });

    if (payment) {
      payment.amount_paid = dto.amount_paid;
    } else {
      payment = this.cardPaymentRepository.create({
        credit_card: { id: creditCardId },
        user: { id: userId },
        month: dto.month,
        amount_paid: dto.amount_paid,
      });
    }

    return this.cardPaymentRepository.save(payment);
  }

  async getPayments(creditCardId: string, userId: string) {
    return this.cardPaymentRepository.find({
      where: { credit_card: { id: creditCardId }, user: { id: userId } },
      order: { month: 'DESC' },
    });
  }
}
