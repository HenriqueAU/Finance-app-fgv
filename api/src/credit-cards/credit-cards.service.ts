import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditCard } from './entities/credit-card.entity';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';

@Injectable()
export class CreditCardsService {
  constructor(
    @InjectRepository(CreditCard)
    private readonly creditCardRepository: Repository<CreditCard>,
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
}
