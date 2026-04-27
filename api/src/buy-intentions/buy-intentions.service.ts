import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { buyIntention } from './entities/buyIntention.entity';
import { CreateBuyIntentionDto } from './dto/create-intention.dto';
import { ProjectionService } from '../projection/projection.service';

@Injectable()
export class BuyIntentionsService {
  constructor(
    @InjectRepository(buyIntention)
    private readonly intentionRepository: Repository<buyIntention>,
    private readonly projectionService: ProjectionService,
  ) {}

  async create(createDto: CreateBuyIntentionDto, userId: string) {
    const { categoryId, ...data } = createDto
    const intention = this.intentionRepository.create({
      ...data,
      user: { id: userId },
      category: categoryId ? { id: categoryId } : null,
      status: 'pending',
    });
    return await this.intentionRepository.save(intention);
  }

  async findAll(userId: string, status?: string) {
    return await this.intentionRepository.find({
      where: { 
        user: { id: userId },
        ...(status && { status: status as any }) 
      },
      relations: ['category'],
    });
  }

  async simulate(dto: CreateBuyIntentionDto, userId: string) {
    return await this.projectionService.simulateIntention(
      userId,
      dto.installment_amount,
      dto.months,
      dto.desired_start_month,
    );
  }

  async updateStatus(id: string, userId: string, status: 'approved' | 'cancelled') {
    const intention = await this.intentionRepository.findOne({
      where: { id, user: { id: userId } }
    });

    if (!intention) {
      throw new NotFoundException('Intenção não encontrada.');
    }

    intention.status = status;
    return await this.intentionRepository.save(intention);
  }

  async remove(id: string, userId: string) {
    const result = await this.intentionRepository.delete({ id, user: { id: userId } });
    if (result.affected === 0) throw new NotFoundException('Intenção não encontrada.');
    return { message: 'Intenção removida com sucesso' };
  }
}