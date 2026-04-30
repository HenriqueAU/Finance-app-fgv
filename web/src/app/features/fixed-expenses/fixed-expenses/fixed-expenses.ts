import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { ExpensesService, Expense, CreateExpenseDto } from '../../../core/services/expenses.service';
import { CategoriesService, Category } from '../../../core/services/categories.service';
import { CreditCardService, CreditCard } from '../../../core/services/credit-cards.service';
@Component({
  selector: 'app-fixed-expenses',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ReactiveFormsModule],
  templateUrl: './fixed-expenses.html'
})
export class FixedExpensesComponent implements OnInit {
  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;
  expenseForm!: FormGroup;
  inlineCategoryForm!: FormGroup;
  showModal = false;
  editingId: string | null = null;

  expenses: Expense[] = [];
  categories: Category[] = [];
  creditCards: CreditCard[] = [];
  isLoading = false;
  errorMessage = '';

  currentMonth: string = '';
  paidExpenseIds = new Set<string>();
  showInlineCategory = false;
  isSavingCategory = false;

  constructor(
    private fb: FormBuilder,
    private expensesService: ExpensesService,
    private categoriesService: CategoriesService,
    private creditCardService: CreditCardService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadExpenses();
    this.loadCategories();
    const now = new Date();
    this.currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.loadPayments();
  }

  initForm() {
    this.expenseForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(3)]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      categoryId: [null],
      due_day: [null, [Validators.min(1), Validators.max(31)]],
      creditCardId: [null]
    });

    this.inlineCategoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      color: ['#10B981', [Validators.required]]
    });
  }

  toggleSidebar(): void {
    if (this.sidebar) {
      this.sidebar.toggleSidebar();
    }
  }

  loadExpenses() {
    this.isLoading = true;
    this.expensesService.getAll().subscribe({
      next: (data) => {
        console.log('expenses:', data);
        this.expenses = [...data];
        this.isLoading = false;

        // CORREÇÃO: O fim do bug de ter que clicar duas vezes!
        this.cdRef.detectChanges();
      },
      error: (_) => {
        console.error('erro:', _);
        this.errorMessage = 'Erro ao carregar contas fixas.';
        this.isLoading = false;
        this.cdRef.detectChanges();
      }
    });

    this.categoriesService.getAll().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Erro ao carregar categorias', err)
    });

    this.creditCardService.getAll().subscribe({
      next: (data) => this.creditCards = data,
      error: (err) => console.error('Erro ao carregar cartões', err)
    });
  }

  toggleInlineCategory() {
    this.showInlineCategory = !this.showInlineCategory;
    if (!this.showInlineCategory) {
      this.inlineCategoryForm.reset({ color: '#10B981' });
    }
  }

  // No seu fixed-expenses.ts
  saveInlineCategory() {
    if (this.inlineCategoryForm.invalid) return;
    
    this.isSavingCategory = true;
    
    // Pegamos os dados do formulário e injetamos a obrigatoriedade do NestJS
    const payload = {
      ...this.inlineCategoryForm.value,
      is_essential: false // <--- A MÁGICA AQUI
    };

    this.categoriesService.create(payload).subscribe({
      next: (newCategory) => {
        this.categories = [...this.categories, newCategory];
        this.expenseForm.patchValue({ categoryId: newCategory.id });
        this.toggleInlineCategory();
        this.isSavingCategory = false;
      },
      error: (err) => {
        console.error('Erro DETALHADO ao criar categoria:', err);
        this.isSavingCategory = false;
      }
    });
  }


  loadCategories() {
    // Adicionamos o 'is_essential' para satisfazer o TypeScript!
    this.categories = [
      { id: 'fake-1', name: 'Moradia', color: '#3B82F6', description: 'Aluguel, luz', is_essential: true } as Category,
      { id: 'fake-2', name: 'Alimentação', color: '#EF4444', description: 'Mercado', is_essential: true } as Category,
      { id: 'fake-3', name: 'Transporte', color: '#F59E0B', description: 'Gasolina, Uber', is_essential: true } as Category,
      { id: 'fake-4', name: 'Saúde', color: '#EC4899', description: 'Farmácia', is_essential: true } as Category,
      { id: 'fake-5', name: 'Lazer', color: '#10B981', description: 'Streaming', is_essential: false } as Category,
      { id: 'fake-6', name: 'Outros', color: '#6B7280', description: 'Diversos', is_essential: false } as Category
    ];
    this.cdRef.detectChanges();
  }

  loadPayments() {
  this.expensesService.getPaymentsByMonth(this.currentMonth).subscribe({
    next: (payments) => {
      this.paidExpenseIds = new Set(
        payments.filter(p => p.paid_at !== null).map(p => p.expense.id)
      );
      this.cdRef.detectChanges();
    }
  });
}

isPaid(expenseId: string): boolean {
  return this.paidExpenseIds.has(expenseId);
}

togglePayment(expense: Expense) {
  const request$ = this.isPaid(expense.id)
    ? this.expensesService.unpay(expense.id, this.currentMonth)
    : this.expensesService.pay(expense.id, this.currentMonth);

  request$.subscribe({
    next: () => this.loadPayments(),
    error: () => this.errorMessage = 'Erro ao atualizar pagamento.'
  });
}

  // Adicione ou atualize esta função no seu arquivo .ts
  getCategoryStyle(color: string | undefined): { [key: string]: string } {
    if (!color) return {}; // Se não tiver cor, não aplica estilo extra

    return {
      'background-color': color + '22', // Fundo com 13% de opacidade
      'color': color,                   // Texto na cor original
      'border-color': color + '44'      // Borda levemente colorida
    };
  }

  toggleModal() {
    this.showModal = !this.showModal;
    if (!this.showModal) {
      this.expenseForm.reset();
      this.editingId = null;
      this.errorMessage = '';
    }
  }

  editExpense(expense: Expense) {
    this.editingId = expense.id;
    this.expenseForm.patchValue({
      description: expense.description,
      amount: expense.amount,
      categoryId: expense.category?.id ?? null,
      due_day: expense.due_day,
    });
    this.showModal = true;
  }

  deleteExpense(id: string) {
    if (confirm('Tem certeza que deseja excluir esta conta?')) {
      this.expensesService.remove(id).subscribe({
        next: () => this.loadExpenses(),
        error: () => this.errorMessage = 'Erro ao excluir conta.'
      });
    }
  }

  toggleActive(expense: Expense) {
    this.expensesService.toggle(expense.id).subscribe({
      next: () => this.loadExpenses(),
      error: () => this.errorMessage = 'Erro ao alternar status.'
    });
  }

  onSubmit() {
    if (this.expenseForm.invalid) return;

    // 1. Fazemos uma cópia dos dados para não alterar o formulário original
    const payload = { ...this.expenseForm.value };

    // 2. A MÁGICA: Forçamos o amount a ser um número real (Isso mata o erro da sua imagem!)
    payload.amount = Number(payload.amount);

    // 3. Limpamos os relacionamentos nulos/vazios para o NestJS não rejeitar os UUIDs
    if (!payload.categoryId || payload.categoryId === 'null') delete payload.categoryId;
    if (!payload.creditCardId || payload.creditCardId === 'null') delete payload.creditCardId;
    
    // Se o dia de vencimento estiver vazio, removemos também
    if (!payload.due_day) delete payload.due_day;

    // --- A partir daqui é a sua lógica normal de salvar ---
    
    // Exemplo de como deve estar sua chamada:
    if (this.editingId) {
      this.expensesService.update(this.editingId, payload).subscribe({
        next: () => {
          this.loadExpenses(); // ou o método que você usa para recarregar a tabela
          this.toggleModal();
        },
        error: (err) => console.error('Erro ao atualizar:', err)
      });
    } else {
      this.expensesService.create(payload).subscribe({
        next: () => {
          this.loadExpenses(); // ou o método que você usa para recarregar a tabela
          this.toggleModal();
        },
        error: (err) => console.error('Erro ao criar:', err)
      });
    }
  }
}
