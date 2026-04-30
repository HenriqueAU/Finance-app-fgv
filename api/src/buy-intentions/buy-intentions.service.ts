import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BuyIntention } from './entities/buyIntention.entity';
import { CreateBuyIntentionDto } from './dto/create-intention.dto';
import { ProjectionService } from '../projection/projection.service';
import { IntentionStatus, ViabilityResult } from '../shared/types';

@Injectable()
export class BuyIntentionsService {
  constructor(
    @InjectRepository(BuyIntention)
    private readonly intentionRepository: Repository<BuyIntention>,
    private readonly projectionService: ProjectionService,
  ) {}

  async create(createDto: CreateBuyIntentionDto, userId: string) {
    const { categoryId, ...data } = createDto;
    const intention = this.intentionRepository.create({
      ...data,
      user: { id: userId },
      category: categoryId ? { id: categoryId } : null,
      status: 'pendente',
    });
    return await this.intentionRepository.save(intention);
  }

  async findAll(userId: string, status?: IntentionStatus) {
    return await this.intentionRepository.find({
      where: {
        user: { id: userId },
        ...(status && { status }),
      },
      relations: ['category'],
      order: { created_at: 'DESC' },
    });
  }

  async simulateIntention(
    userId: string,
    installmentAmount: number,
    months: number,
    desiredStartMonth: string,
  ): Promise<ViabilityResult> {
    const affectedMonths = this.projectionService.getMonthsBetween(
      desiredStartMonth,
      this.projectionService.addMonths(desiredStartMonth, months - 1),
    );

    const projections = await Promise.all(
      affectedMonths.map(async (month) => {
        const base = await this.projectionService.getMonthProjection(
          userId,
          month,
        );
        return {
          ...base,
          totalIntentions: installmentAmount,
          available: base.available - installmentAmount,
          freeToSpend: base.freeToSpend - installmentAmount,
          isCritical: base.freeToSpend - installmentAmount < 0,
        };
      }),
    );

    const criticalMonths = projections
      .filter((p) => p.isCritical)
      .map((p) => p.month);

    return {
      viable: criticalMonths.length === 0,
      criticalMonths,
      projection: projections,
    };
  }

  async updateStatus(
    id: string,
    userId: string,
    status: 'aprovada' | 'cancelada',
  ) {
    const intention = await this.intentionRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!intention) {
      throw new NotFoundException('Intenção não encontrada.');
    }

    intention.status = status;
    return await this.intentionRepository.save(intention);
  }

  async update(
    id: string,
    userId: string,
    dto: Partial<CreateBuyIntentionDto>,
  ) {
    const intention = await this.intentionRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!intention) throw new NotFoundException('Intenção não encontrada.');

    const { categoryId, ...data } = dto;

    Object.assign(intention, {
      ...data,
      category: categoryId ? { id: categoryId } : intention.category,
    });
    console.log('salvando intention:', intention);
    const saved = await this.intentionRepository.save(intention);
    console.log('salvo:', saved);
    return saved;
  }

  async remove(id: string, userId: string) {
    const intention = await this.intentionRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!intention) throw new NotFoundException('Intenção não encontrada.');
    await this.intentionRepository.remove(intention);
    return { message: 'Intenção removida com sucesso' };
  }
}
