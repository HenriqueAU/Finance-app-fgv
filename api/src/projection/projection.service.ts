import { Injectable } from '@nestjs/common';
import { ExpensesService } from '../expenses/expenses.service';
import { InstallmentsService } from '../installments/installments.service';
import { UsersService } from '../users/users.service';
import { MonthProjection, ViabilityResult } from '../shared/types';

@Injectable()
export class ProjectionService {
  constructor(
    private readonly expensesService: ExpensesService,
    private readonly installmentsService: InstallmentsService,
    private readonly usersService: UsersService,
  ) {}

  async getMonthProjection(
    userId: string,
    month: string,
  ): Promise<MonthProjection> {
    const user = await this.usersService.findById(userId);
    const expenses = await this.expensesService.findActive(userId);
    const installments = await this.installmentsService.findByMonth(
      userId,
      month,
    );

    const totalFixed = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalInstallments = installments.reduce(
      (sum, i) => sum + Number(i.installment_amount),
      0,
    );

    const available = user.salary - totalFixed - totalInstallments;
    const freeToSpend = available - user.emergency_reserve;

    return {
      month,
      salary: user.salary,
      totalFixed,
      totalInstallments,
      totalIntentions: 0,
      available,
      emergencyReserve: user.emergency_reserve,
      freeToSpend,
      isCritical: freeToSpend < 0,
    };
  }

  async getProjectionRange(
    userId: string,
    fromMonth: string,
    toMonth: string,
  ): Promise<MonthProjection[]> {
    const months = this.getMonthsBetween(fromMonth, toMonth);
    return await Promise.all(
      months.map((month) => this.getMonthProjection(userId, month)),
    );
  }

  async simulateIntention(
    userId: string,
    installmentAmount: number,
    months: number,
    desiredStartMonth: string,
  ): Promise<ViabilityResult> {
    const affectedMonths = this.getMonthsBetween(
      desiredStartMonth,
      this.addMonths(desiredStartMonth, months - 1),
    );

    const projections = await Promise.all(
      affectedMonths.map(async (month) => {
        const base = await this.getMonthProjection(userId, month);
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

  private getMonthsBetween(from: string, to: string): string[] {
    const months: string[] = [];
    let current = from;
    while (current <= to) {
      months.push(current);
      current = this.addMonths(current, 1);
    }
    return months;
  }

  private addMonths(month: string, count: number): string {
    const [year, m] = month.split('-').map(Number);
    const date = new Date(year, m - 1 + count);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
}
