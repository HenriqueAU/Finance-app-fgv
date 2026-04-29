import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { MonthlySnapshot } from './entities/monthly-snapshot.entity';
import { ProjectionService } from '../projection/projection.service';
import { UsersService } from '../users/users.service';
import { forwardRef, Inject } from '@nestjs/common';

@Injectable()
export class SnapshotsService {
  constructor(
    @InjectRepository(MonthlySnapshot)
    private readonly snapshotRepository: Repository<MonthlySnapshot>,
    @Inject(forwardRef(() => ProjectionService))
    private readonly projectionService: ProjectionService,
    private readonly usersService: UsersService,
  ) {}

  async findByMonth(
    userId: string,
    month: string,
  ): Promise<MonthlySnapshot | null> {
    return this.snapshotRepository.findOne({
      where: { user: { id: userId }, month },
    });
  }

  async findCurrent(userId: string): Promise<MonthlySnapshot | null> {
    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1);
    const month = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}`;
    return this.findByMonth(userId, month);
  }

  async createSnapshot(
    userId: string,
    month: string,
  ): Promise<MonthlySnapshot> {
    const existing = await this.findByMonth(userId, month);
    if (existing) return existing;

    const projection = await this.projectionService.getMonthProjection(
      userId,
      month,
    );

    const snapshot = this.snapshotRepository.create({
      user: { id: userId },
      month,
      free_to_spend: projection.freeToSpend,
    });

    return this.snapshotRepository.save(snapshot);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @Cron('0 0 1 * *')
  async handleMonthTurn() {
    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1);
    const month = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}`;

    const users = await this.usersService.findAll();
    await Promise.all(users.map((user) => this.createSnapshot(user.id, month)));
  }
}
