import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { of, delay } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { MonthProjection } from '../../../shared/types';
import { ProjectionService } from '../../../core/services/projection';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SidebarComponent, CommonModule, BaseChartDirective],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  current: MonthProjection | null = null;
  range: MonthProjection[] = [];
  isLoading: boolean = true;

  // --- Configurações Iniciais (Zerdas para a animação funcionar) ---
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Fixas', 'Parcelas', 'Intenções Aprovadas'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#2563eb', '#f59e0b', '#cbd5e1']
    }]
  };

  public doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    animation: { duration: 1500, animateRotate: true, animateScale: true }
  };

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Fixas', backgroundColor: '#2563eb', stack: 'a' },
      { data: [], label: 'Parcelas', backgroundColor: '#f59e0b', stack: 'a' },
      { data: [], label: 'Saldo Livre', backgroundColor: '#10b981', stack: 'a' }
    ]
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: { x: { stacked: true }, y: { stacked: true } },
    animation: { duration: 1500, easing: 'easeOutBounce' }
  };

  constructor(private cdr: ChangeDetectorRef, private projectionService: ProjectionService) {}

  ngOnInit() {
    const now = new Date();
    const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const to = this.addMonths(from, 2);

    this.projectionService.getCurrent().subscribe((current) => {
      this.current = current;
      this.isLoading = false;
      this.cdr.detectChanges();

      setTimeout(() => {
        this.doughnutChartData = {
          labels: this.doughnutChartData.labels,
          datasets: [{
            ...this.doughnutChartData.datasets[0],
            data: [current.totalFixed, current.totalInstallments, current.totalIntentions]
          }]
        };
        this.cdr.detectChanges();
      }, 50);
    });

    this.projectionService.getRange(from, to).subscribe((range) => {
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
    private addMonths(month: string, count: number): string {
    const [year, m] = month.split('-').map(Number);
    const date = new Date(year, m - 1 + count);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
}
