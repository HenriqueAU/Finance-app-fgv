import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions, Chart } from 'chart.js';
import { MonthProjection, MonthlySnapshot } from '../../../shared/types';
import { ProjectionService } from '../../../core/services/projection';
import { CreditCard, CreditCardService, CreditCardUsage } from '../../../core/services/credit-cards.service';
import { AuthService } from '../../../core/services/auth.service';
import { SnapshotsService } from '../../../core/services/snapshot.services';
import { ExpensesService, Expense } from '../../../core/services/expenses.service';

interface DueDateAlert {
  id: string;
  description: string;
  amount: number;
  message: string;
  colorClass: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SidebarComponent, CommonModule, BaseChartDirective],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;

  current: MonthProjection | null = null;
  range: MonthProjection[] = [];
  creditCards: CreditCardUsage[] = [];
  isLoading: boolean = true;

  // Fundos disponíveis
  snapshot: MonthlySnapshot | null = null;
  userSavings: number = 0;
  userSalary: number = 0;
  userPayday: number | null = null;
  salaryAlreadyEntered: boolean = false;
  totalAvailableFunds: number = 0;

  dueDateAlerts: DueDateAlert[] = [];
  showAlerts = true;
  private colors = {
    rose: '#f43f5e',
    blue: '#3b82f6',
    emerald: '#10b981',
    slate400: '#94a3b8',
    white: '#ffffff'
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private projectionService: ProjectionService,
    private creditCardService: CreditCardService,
    private snapshotsService: SnapshotsService,
    private authService: AuthService,
    private expensesService: ExpensesService,
  ) {
    this.applyGlobalChartSettings();
  }

  public pieChartData: ChartData<'pie'> = {
    labels: ['Fixas', 'Parcelas', 'Intenções'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: [this.colors.rose, this.colors.blue, this.colors.emerald],
      borderWidth: 0,
      hoverOffset: 20
    }]
  };

  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 25, usePointStyle: true, pointStyle: 'circle', font: { size: 12, weight: 'bold' }, color: this.colors.slate400 } },
      tooltip: this.getPremiumTooltipSettings()
    }
  };

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Fixas', backgroundColor: this.colors.rose, stack: 'a', barPercentage: 0.6 },
      { data: [], label: 'Parcelas', backgroundColor: this.colors.blue, stack: 'a', barPercentage: 0.6 },
      { data: [], label: 'Saldo Livre', backgroundColor: this.colors.emerald, stack: 'a', barPercentage: 0.6, borderRadius: { topLeft: 12, topRight: 12 } }
    ]
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 25, usePointStyle: true, pointStyle: 'circle', font: { size: 12, weight: 'bold' }, color: this.colors.slate400 } },
      tooltip: this.getPremiumTooltipSettings()
    },
    scales: {
      x: { stacked: true, grid: { display: false }, border: { display: false }, ticks: { font: { weight: 'bold' }, color: this.colors.slate400 } },
      y: { stacked: true, border: { display: false }, grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { callback: (value) => `R$ ${value}`, color: this.colors.slate400, font: { size: 11 } } }
    }
  };

  ngOnInit(): void {
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const to = this.addMonths(currentMonthStr, 2);

    this.projectionService.getCurrent().subscribe((current: MonthProjection) => {
      this.current = current;
      this.isLoading = false;
      this.cdr.detectChanges();

      setTimeout(() => {
        this.pieChartData = {
          labels: this.pieChartData.labels,
          datasets: [{
            ...this.pieChartData.datasets[0],
            data: [current.totalFixed, current.totalInstallments, current.totalIntentions]
          }]
        };
        this.cdr.detectChanges();
      }, 50);
    });

    this.creditCardService.getAll().subscribe({
      next: (cards: CreditCard[]) => {
        const usageRequests = cards.map(card =>
          this.creditCardService.getDashboardCardsUsage(card.id, currentMonthStr)
        );

        Promise.all(usageRequests.map(req => req.toPromise())).then(usages => {
          this.creditCards = usages.map((usage, i) => ({
            ...usage!,
            name: cards[i].name,
            usagePercentage: Math.min(Math.round((usage!.totalOwed / usage!.limit) * 100), 100)
          }));
          this.cdr.detectChanges();
        });
      },
      error: (err: any) => {
        console.error('Erro ao buscar cartões:', err);
      }
    });

    this.projectionService.getRange(currentMonthStr, to).subscribe((range: MonthProjection[]) => {
      this.range = range;
      setTimeout(() => {
        this.barChartData = {
          labels: range.map(m => m.month),
          datasets: [
            { ...this.barChartData.datasets[0], data: range.map(m => m.totalFixed) },
            { ...this.barChartData.datasets[1], data: range.map(m => m.totalInstallments) },
            { ...this.barChartData.datasets[2], data: range.map(m => m.freeToSpend) }
          ]
        };
        this.cdr.detectChanges();
      }, 50);
    });

    // Fundos disponíveis
    this.snapshotsService.getCurrent().subscribe({
      next: (snapshot) => {
        this.snapshot = snapshot;
        this.cdr.detectChanges();
      },
      error: () => { this.snapshot = null; }
    });

    this.authService.getMe().subscribe({
      next: (user) => {
        this.userSavings = Number(user.savings) || 0;
        this.userSalary = Number(user.salary) || 0;
        this.userPayday = user.payday ?? null;
        this.salaryAlreadyEntered = user.payday !== null
          ? now.getDate() >= user.payday
          : true;
        this.recalculateFunds();
        this.cdr.detectChanges();
      }
    });
  // Avisos de vencimento
  this.expensesService.getAll().subscribe({
    next: (expenses) => {
      const today = new Date();
      const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

      this.expensesService.getPaymentsByMonth(currentMonth).subscribe({
        next: (payments) => {
          const paidIds = new Set(
            payments.filter(p => p.paid_at !== null).map((p: any) => p.expense.id)
          );

          this.dueDateAlerts = expenses
            .filter(e => e.is_active && e.due_day !== null && !paidIds.has(e.id))
            .map(e => {
              const dueDate = new Date(today.getFullYear(), today.getMonth(), e.due_day!);
              const diffDays = Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              let message = '';
              let colorClass = '';

              if (diffDays === 0) {
                message = 'Vence hoje';
                colorClass = 'text-rose-500';
              } else if (diffDays > 0 && diffDays <= 3) {
                message = `Faltam ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
                colorClass = 'text-amber-400';
              } else if (diffDays < 0) {
                message = `Venceu há ${Math.abs(diffDays)} dia${Math.abs(diffDays) > 1 ? 's' : ''}`;
                colorClass = 'text-rose-400';
              }

              return message ? { id: e.id, description: e.description, amount: e.amount, message, colorClass } : null;
            })
            .filter((a): a is DueDateAlert => a !== null);

          this.cdr.detectChanges();
        }
      });
    }
  });
}

  recalculateFunds(): void {
    const snapshotValue = this.snapshot ? Number(this.snapshot.freeToSpend) : 0;
    const salaryValue = this.salaryAlreadyEntered ? this.userSalary : 0;
    const cardDebt = this.current ? this.current.cardDebt : 0;
    this.totalAvailableFunds = snapshotValue + salaryValue + this.userSavings - cardDebt;
  }

  toggleSidebar(): void {
    if (this.sidebar) {
      this.sidebar.toggleSidebar();
    }
  }

  getUsageColor(percentage: number): string {
    if (percentage >= 90) return 'text-rose-500';
    if (percentage >= 70) return 'text-amber-500';
    return 'text-emerald-500';
  }

  getProgressBarColor(percentage: number): string {
    if (percentage >= 90) return 'bg-rose-500';
    if (percentage >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  }

  private applyGlobalChartSettings(): void {
    Chart.defaults.font.family = "'Inter', sans-serif";
  }

  private getPremiumTooltipSettings(): any {
    return {
      backgroundColor: '#1e293b',
      titleFont: { size: 14, weight: 'bold' },
      bodyFont: { size: 13 },
      padding: 15,
      cornerRadius: 12,
      boxPadding: 8,
      usePointStyle: true,
      callbacks: {
        label: (context: any) => {
          let label = context.dataset.label || '';
          const value = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
          if (label) label += ': ';
          return label + new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
        }
      }
    };
  }

  private addMonths(month: string, count: number): string {
    const [year, m] = month.split('-').map(Number);
    const date = new Date(year, m - 1 + count);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
}
