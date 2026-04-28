import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { ExpensesService, Expense, CreateExpenseDto } from '../../../core/services/expenses.service';
import { CategoriesService, Category } from '../../../core/services/categories.service';

@Component({
  selector: 'app-fixed-expenses',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ReactiveFormsModule],
  templateUrl: './fixed-expenses.html'
})
export class FixedExpensesComponent implements OnInit {
  expenseForm!: FormGroup;
  showModal = false;
  editingId: string | null = null;

  expenses: Expense[] = [];
  categories: Category[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private expensesService: ExpensesService,
    private categoriesService: CategoriesService
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadExpenses();
    this.loadCategories();
  }

  initForm() {
    this.expenseForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(3)]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      categoryId: [null],
      due_day: [null, [Validators.min(1), Validators.max(31)]],
    });
  }

  loadExpenses() {
    this.isLoading = true;
    this.expensesService.getAll().subscribe({
      next: (data) => {
        console.log('expenses:', data);
        this.expenses = [...data];
        this.isLoading = false;
      },
      error: (_) => {
        console.error('erro:', _);
        this.errorMessage = 'Erro ao carregar contas fixas.';
        this.isLoading = false;
      }
    });
  }

  loadCategories() {
    this.categoriesService.getAll().subscribe({
      next: (data) => this.categories = data,
      error: () => {} // silencioso, categoria é opcional
    });
  }

  getCategoryStyle(color: string | undefined): { [key: string]: string } {
    if (!color) return {};
    return {
      'background-color': color + '22', // ~13% opacity
      'color': color,
      'border-color': color + '55'
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
        next: () => this.loadExpenses(), // idem
        error: () => this.errorMessage = 'Erro ao excluir conta.'
      });
    }
  }

  toggleActive(expense: Expense) {
    this.expensesService.toggle(expense.id).subscribe({
      next: () => this.loadExpenses(), // idem
      error: () => this.errorMessage = 'Erro ao alternar status.'
    });
  }

  onSubmit() {
    if (this.expenseForm.invalid) return;
    const dto: CreateExpenseDto = this.expenseForm.value;

    const request$ = this.editingId
      ? this.expensesService.update(this.editingId, dto)
      : this.expensesService.create(dto);

    request$.subscribe({
      next: () => {
        this.loadExpenses(); // recarrega do back em vez de manipular o array
        this.toggleModal();
      },
        error: () => this.errorMessage = 'Erro ao salvar conta.'
    });
  }
}
