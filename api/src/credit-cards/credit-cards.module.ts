import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditCardsService } from './credit-cards.service';
import { CreditCardsController } from './credit-cards.controller';
import { CreditCard } from './entities/credit-card.entity';
import { CardPayment } from './entities/card-payment.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { Installment } from '../installments/entities/installment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CreditCard, CardPayment, Expense, Installment]),
  ],
  controllers: [CreditCardsController],
  providers: [CreditCardsService],
  exports: [CreditCardsService],
})
export class CreditCardsModule {}
