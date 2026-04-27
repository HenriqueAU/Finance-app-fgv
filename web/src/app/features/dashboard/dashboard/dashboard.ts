import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { of, delay } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SidebarComponent, CommonModule, BaseChartDirective], 
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  summary: any = null; 
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
    labels: ['Jun/2025', 'Jul/2025', 'Ago/2025'],
    datasets: [
      { data: [0, 0, 0], label: 'Fixas', backgroundColor: '#2563eb', stack: 'a' },
      { data: [0, 0, 0], label: 'Parcelas', backgroundColor: '#f59e0b', stack: 'a' },
      { data: [0, 0, 0], label: 'Saldo Livre', backgroundColor: '#10b981', stack: 'a' }
    ]
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: { x: { stacked: true }, y: { stacked: true } },
    animation: { duration: 1500, easing: 'easeOutBounce' }
  };

  constructor(private cdr: ChangeDetectorRef) {} 

  ngOnInit() {
    // Simulando dados do Backend
    const mockData = {
      salary: 5000,
      totalCommitted: 1730,
      fixedExpenses: 1380,
      installments: 350,
      approvedIntentions: 0,
      emergencyReserve: 1500,
      freeBalance: 1770
    };

    of(mockData).pipe(delay(1000)).subscribe((dados) => {
      // 1. Mostra a estrutura (Cards e Gráficos vazios)
      this.summary = dados;
      this.isLoading = false; 
      this.cdr.detectChanges(); 

      // 2. Delay curtíssimo para "acordar" o Chart.js e disparar a animação
      setTimeout(() => {
        this.doughnutChartData = {
          labels: this.doughnutChartData.labels,
          datasets: [{ 
            ...this.doughnutChartData.datasets[0], 
            data: [dados.fixedExpenses, dados.installments, dados.approvedIntentions] 
          }]
        };

        this.barChartData = {
          labels: this.barChartData.labels,
          datasets: [
            { ...this.barChartData.datasets[0], data: [dados.fixedExpenses, dados.fixedExpenses, dados.fixedExpenses] },
            { ...this.barChartData.datasets[1], data: [dados.installments, dados.installments, 0] },
            { ...this.barChartData.datasets[2], data: [dados.freeBalance, dados.freeBalance, dados.freeBalance + dados.installments] }
          ]
        };
        this.cdr.detectChanges();
      }, 50); 
    });
  }
}