import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { InstallmentsService } from '../../../core/services/installments.service';

interface Installment {
  id: string;
  name: string;
  category: string;
  monthlyValue: number;
  currentParcel: number;
  totalParcels: number;
}

@Component({
  selector: 'app-installments',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ReactiveFormsModule],
  templateUrl: './installments.html'
})
export class InstallmentsComponent implements OnInit {
  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;

  installmentForm!: FormGroup;
  showModal = false;
  editingId: string | null = null;

  installments: Installment[] = [];
  categories: any[] = [];

  constructor(
    private fb: FormBuilder,
    private installmentsService: InstallmentsService
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadData();
  }

  initForm() {
    this.installmentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      category: [''],
      monthlyValue: ['', [Validators.required, Validators.min(0.01)]],
      currentParcel: ['', [Validators.required, Validators.min(1)]],
      totalParcels: ['', [Validators.required, Validators.min(1)]],
    });
  }

  loadData() {
    this.installmentsService.getCategories().subscribe(cats => this.categories = cats);
    this.installmentsService.getInstallments().subscribe(data => {
      this.installments = data.map(item => this.mapToFrontend(item));
    });
  }

  private mapToFrontend(item: any): Installment {
    const startStr = item.start_month || new Date().toISOString().slice(0, 7);
    const start = new Date(startStr + '-01');
    const now = new Date();

    let current = 1;
    if (!isNaN(start.getTime())) {
      const diff = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
      current = Math.max(1, Math.min(diff + 1, item.total_months || 1));
    }

    return {
      id: item.id,
      name: item.description,
      category: item.category?.name || 'Geral',
      monthlyValue: Number(item.installment_amount),
      currentParcel: current,
      totalParcels: item.total_months
    };
  }

  onSubmit() {
    if (this.installmentForm.valid) {
      const form = this.installmentForm.value;

      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - (form.currentParcel - 1));
      const startMonthStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;

      const payload = {
        description: form.name,
        installment_amount: Number(form.monthlyValue),
        total_months: Number(form.totalParcels),
        start_month: startMonthStr,
        categoryId: form.category || null
      };

      if (this.editingId !== null) {
        this.installmentsService.updateInstallment(this.editingId, payload).subscribe({
          next: () => {
            this.loadData();
            this.toggleModal();
          },
          error: (err) => alert(err.error?.message || 'Erro ao atualizar')
        });
      } else {
        this.installmentsService.createInstallment(payload).subscribe({
          next: () => {
            this.loadData();
            this.toggleModal();
          },
          error: (err) => alert(err.error?.message || 'Erro ao salvar')
        });
      }
    }
  }

  deleteInstallment(id: string) {
    if (confirm('Deseja remover este parcelamento?')) {
      this.installmentsService.deleteInstallment(id).subscribe(() => this.loadData());
    }
  }

  editInstallment(id: string) {
    const item = this.installments.find(i => i.id === id);
    if (item) {
      this.editingId = id;
      this.installmentForm.patchValue(item);
      this.showModal = true;
    }
  }

  getProgress(current: number, total: number): number {
    return Math.min(Math.round((current / total) * 100), 100);
  }

  toggleModal() {
    this.showModal = !this.showModal;
    if (!this.showModal) {
      this.installmentForm.reset();
      this.editingId = null;
    }
  }

  toggleSidebar(): void {
    if (this.sidebar) {
      this.sidebar.toggleSidebar();
    }
  }
}
