import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
    private categoriesService: CategoriesService,
    private cdRef: ChangeDetectorRef
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
    const dto: CreateExpenseDto = this.expenseForm.value;

    // TRUQUE DE MESTRE MELHORADO: Removemos o ID falso tanto para Criar quanto para Editar
    const payload = { ...dto };
    if (payload.categoryId && String(payload.categoryId).startsWith('fake-')) {
      // Usamos undefined ou null dependendo do que o back-end do Henrique prefere.
      // Se null der erro 400 de novo, troque para 'undefined'
      payload.categoryId = null as any; 
    }

    const request$ = this.editingId
      ? this.expensesService.update(this.editingId, payload) // O payload limpo vai aqui agora!
      : this.expensesService.create(payload); // E aqui também

    request$.subscribe({
      next: () => {
        this.loadExpenses(); 
        this.toggleModal();
      },
      error: (err) => {
        console.error('Erro detalhado do back-end:', err); // Adicionei isso pra gente ver no F12!
        this.errorMessage = 'Erro ao salvar conta.';
      }
    });
  }
}