import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions, Chart } from 'chart.js';
import { MonthProjection } from '../../../shared/types';
import { ProjectionService } from '../../../core/services/projection';
// Importação apontando para a pasta correta no core
import { CreditCardService, CreditCardUsage } from '../../../core/services/credit-cards.service';

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
    private creditCardService: CreditCardService
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

    this.creditCardService.getDashboardCardsUsage(currentMonthStr).subscribe({
      next: (cards: CreditCardUsage[]) => {
        this.creditCards = cards;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erro ao buscar uso dos cartões:', err);
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