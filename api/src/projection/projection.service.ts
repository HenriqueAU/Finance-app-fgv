import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ExpensesService } from '../expenses/expenses.service';
import { InstallmentsService } from '../installments/installments.service';
import { UsersService } from '../users/users.service';
import { SnapshotsService } from '../snapshots/snapshots.service';
import { CreditCardsService } from '../credit-cards/credit-cards.service';
import { MonthProjection } from '../shared/types';

@Injectable()
export class ProjectionService {
  constructor(
    private readonly expensesService: ExpensesService,
    private readonly installmentsService: InstallmentsService,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => SnapshotsService))
    private readonly snapshotsService: SnapshotsService,
    private readonly creditCardsService: CreditCardsService,
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

    const salary = Number(user.salary) || 0;
    const emergencyReserve = Number(user.emergency_reserve) || 0;
    const savings = Number(user.savings) || 0;

    // payday — salário só entra no dia definido
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const salaryThisMonth =
      month === currentMonth &&
      user.payday !== null &&
      today.getDate() < user.payday
        ? 0
        : salary;

    // snapshot do mês anterior
    const snapshot = await this.snapshotsService.findCurrent(userId);
    const snapshotValue = snapshot ? Number(snapshot.free_to_spend) : 0;

    // card debt — soma totalOwed de todos os cartões
    const creditCards = await this.creditCardsService.findAll(userId);
    const cardDebts = await Promise.all(
      creditCards.map((card) =>
        this.creditCardsService.getUsage(card.id, userId, month),
      ),
    );
    const cardDebt = cardDebts.reduce((sum, usage) => sum + usage.totalOwed, 0);

    const available = salaryThisMonth - totalFixed - totalInstallments;
    const freeToSpend =
      snapshotValue +
      salaryThisMonth +
      savings -
      totalFixed -
      totalInstallments -
      emergencyReserve -
      cardDebt;

    return {
      month,
      salary: salaryThisMonth,
      totalFixed,
      totalInstallments,
      totalIntentions: 0,
      available,
      emergencyReserve,
      snapshot: snapshotValue,
      savings,
      cardDebt,
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

  public getMonthsBetween(from: string, to: string): string[] {
    if (from > to) return [];
    const months: string[] = [];
    let current = from;
    while (current <= to) {
      months.push(current);
      current = this.addMonths(current, 1);
    }
    return months;
  }

  public addMonths(month: string, count: number): string {
    const [year, m] = month.split('-').map(Number);
    const date = new Date(year, m - 1 + count);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
}
