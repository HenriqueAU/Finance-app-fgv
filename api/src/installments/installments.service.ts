import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Installment } from './entities/installment.entity';
import { CreateInstallmentDto } from './dto/create-installment.dto';
import { UpdateInstallmentDto } from './dto/update-installment.dto';

@Injectable()
export class InstallmentsService {
  constructor(
    @InjectRepository(Installment)
    private readonly installmentRepository: Repository<Installment>,
  ) {}

  private calculateEndMonth(startMonth: string, totalMonths: number): string {
    const [year, month] = startMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + totalMonths - 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  private isActiveInMonth(
    startMonth: string,
    totalMonths: number,
    targetMonth: string,
  ): boolean {
    const endMonth = this.calculateEndMonth(startMonth, totalMonths);
    return startMonth <= targetMonth && endMonth >= targetMonth;
  }

  async create(userId: string, dto: CreateInstallmentDto) {
    const installment = this.installmentRepository.create({
      ...dto,
      user: { id: userId },
      category: dto.categoryId ? { id: dto.categoryId } : undefined,
      credit_card: dto.creditCardId ? { id: dto.creditCardId } : undefined,
    });

    const saved = await this.installmentRepository.save(installment);
    return {
      ...saved,
      endMonth: this.calculateEndMonth(saved.start_month, saved.total_months),
    };
  }

  async findAll(userId: string) {
    const installments = await this.installmentRepository.find({
      where: { user: { id: userId } },
      relations: ['category', 'credit_card'],
    });

    return installments.map((i) => ({
      ...i,
      endMonth: this.calculateEndMonth(i.start_month, i.total_months),
    }));
  }

  async findActive(userId: string) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const all = await this.findAll(userId);
    return all.filter((i) =>
      this.isActiveInMonth(i.start_month, i.total_months, currentMonth),
    );
  }

  async findByMonth(userId: string, month: string) {
    const all = await this.findAll(userId);
    return all.filter((i) =>
      this.isActiveInMonth(i.start_month, i.total_months, month),
    );
  }

  async update(id: string, userId: string, dto: UpdateInstallmentDto) {
    const installment = await this.installmentRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!installment)
      throw new NotFoundException('Parcelamento não encontrado');

    Object.assign(installment, {
      ...dto,
      category: dto.categoryId ? { id: dto.categoryId } : installment.category,
      credit_card: dto.creditCardId
        ? { id: dto.creditCardId }
        : installment.credit_card,
    });

    const saved = await this.installmentRepository.save(installment);
    return {
      ...saved,
      endMonth: this.calculateEndMonth(saved.start_month, saved.total_months),
    };
  }

  async remove(id: string, userId: string) {
    const installment = await this.installmentRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!installment)
      throw new NotFoundException('Parcelamento não encontrado');

    await this.installmentRepository.remove(installment);
    return { message: 'Parcelamento removido com sucesso' };
  }
}
