import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { InstallmentsService } from '../../../core/services/installments.service';
import { CategoriesService, Category } from '../../../core/services/categories.service';
import { CreditCardService, CreditCard } from '../../../core/services/credit-cards.service';

interface Installment {
  id: string;
  name: string;
  category: string;
  categoryColor?: string;
  monthlyValue: number;
  currentParcel: number;
  totalParcels: number;
  categoryId?: string;
  creditCardId?: string;
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
  inlineCategoryForm!: FormGroup; // CORREÇÃO: Faltava a exclamação (!)

  installments: Installment[] = [];
  categories: Category[] = [];
  creditCards: CreditCard[] = [];

  showModal = false;
  showInlineCategory = false;
  isSavingCategory = false;
  isLoading = true;
  editingId: string | null = null;
  isSubmitting = false;

  limitWarning = '';

  constructor(
    private fb: FormBuilder,
    private installmentsService: InstallmentsService,
    private categoriesService: CategoriesService,
    private creditCardService: CreditCardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadData();
  }

  initForm() {
    this.installmentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      categoryId: [null],
      monthlyValue: ['', [Validators.required, Validators.min(0.01)]],
      currentParcel: ['', [Validators.required, Validators.min(1)]],
      totalParcels: ['', [Validators.required, Validators.min(1)]],
      type: ['regular'],
      creditCardId: [null]
    });

    this.inlineCategoryForm = this.fb.group({
      name: ['', Validators.required],
      color: ['#10B981', Validators.required]
    });

    this.creditCardService.getAll().subscribe({
      next: (data) => {
        this.creditCards = data;
        this.cdr.detectChanges(); // Garante que o select do HTML seja preenchido
      },
      error: (err) => console.error('Erro ao buscar cartões:', err)
    });
  }

  loadData() {
    this.isLoading = true;

    // Carrega Categorias
    this.categoriesService.getAll().subscribe(data => this.categories = data);

    // Carrega Cartões
    this.creditCardService.getAll().subscribe(data => this.creditCards = data);

    // Carrega Parcelamentos
    this.installmentsService.getInstallments().subscribe({
      next: (data: any[]) => {
        // CORREÇÃO: Usando a sua função para formatar os dados que vêm do banco
        this.installments = data.map(item => this.mapToFrontend(item));
        this.isLoading = false;
        this.cdr.detectChanges(); // Detecta mudanças e atualiza a view
      },
      error: (err: any) => {
        console.error('Erro ao buscar parcelamentos:', err);
        this.isLoading = false;
        this.cdr.detectChanges(); // Detecta mudanças e atualiza a view
      }
    });
  }

  private mapToFrontend(item: any): Installment {
    let startYear: number;
    let startMonth: number;

    if (item.start_month) {
      // A MÁGICA: Ao usar métodos UTC, ignoramos o desconto de 3 horas do fuso do Brasil,
      // garantindo que o mês lido seja exatamente o mês salvo, sem voltar pro dia 31 do mês passado.
      const dateObj = new Date(item.start_month);
      startYear = dateObj.getUTCFullYear();
      startMonth = dateObj.getUTCMonth();
    } else {
      const today = new Date();
      startYear = today.getFullYear();
      startMonth = today.getMonth();
    }

    const now = new Date();
    // Usa o ano/mês atuais para comparar
    const diff = (now.getFullYear() - startYear) * 12 + (now.getMonth() - startMonth);
    const current = Math.max(1, Math.min(diff + 1, item.total_months || 1));

    return {
      id: item.id,
      name: item.description,
      category: item.category?.name || 'Geral',
      categoryColor: item.category?.color || '#cbd5e1',
      monthlyValue: Number(item.installment_amount),
      currentParcel: current,
      totalParcels: item.total_months,
      categoryId: item.category?.id,
      creditCardId: item.credit_card?.id
    };
  }

  toggleInlineCategory() {
    this.showInlineCategory = !this.showInlineCategory;
    if (!this.showInlineCategory) this.inlineCategoryForm.reset({ color: '#10B981' });
  }

  saveInlineCategory() {
    if (this.inlineCategoryForm.invalid) return;

    this.isSavingCategory = true;
    const payload = {
      ...this.inlineCategoryForm.value,
      is_essential: false // Injetando o boolean pro NestJS não reclamar
    };

    this.categoriesService.create(payload).subscribe({
      next: (newCategory) => {
        this.categories = [...this.categories, newCategory];
        this.installmentForm.patchValue({ categoryId: newCategory.id });
        this.toggleInlineCategory();
        this.isSavingCategory = false;
      },
      error: (err) => {
        console.error('Erro DETALHADO ao criar categoria:', err);
        this.isSavingCategory = false;
      }
    });
  }

  onSubmit() {
    if (this.installmentForm.invalid) return;

    this.isSubmitting = true;
    const formValues = this.installmentForm.value;

    const currentParcel = Number(formValues.currentParcel);
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    startDate.setMonth(startDate.getMonth() - (currentParcel - 1));
    const startMonth = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;

    const payload: any = {
      description: formValues.name,
      installment_amount: Number(formValues.monthlyValue),
      total_months: Number(formValues.totalParcels),
      start_month: startMonth,
      type: formValues.type || 'regular',
    };

    if (formValues.categoryId && formValues.categoryId !== 'null') payload.categoryId = formValues.categoryId;
    if (formValues.creditCardId && formValues.creditCardId !== 'null') payload.creditCardId = formValues.creditCardId;

    const creditCardId = formValues.creditCardId;

    if (creditCardId && creditCardId !== 'null') {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      this.creditCardService.getDashboardCardsUsage(creditCardId, month).subscribe({
        next: (usage) => {
          if (payload.installment_amount > usage.available) {
            this.limitWarning = `Limite insuficiente. Disponível: R$ ${usage.available.toFixed(2)}`;
            this.isSubmitting = false;
            this.cdr.detectChanges();
            return;
          }
          this.limitWarning = '';
          this.saveInstallment(payload);
        },
        error: () => this.saveInstallment(payload)
      });
    } else {
      this.saveInstallment(payload);
    }
  }

  private saveInstallment(payload: any) {
    const request$ = this.editingId
      ? this.installmentsService.updateInstallment(this.editingId, payload)
      : this.installmentsService.createInstallment(payload);

    request$.subscribe({
      next: () => {
        this.loadData();
        this.toggleModal();
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Erro ao salvar parcelamento:', err);
        this.isSubmitting = false;
      }
    });
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
      this.installmentForm.reset({ type: 'regular' });
      this.editingId = null;
    }
  }

  toggleSidebar(): void {
    if (this.sidebar) {
      this.sidebar.toggleSidebar();
    }
  }
}
