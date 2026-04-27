import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';

interface Expense {
  id: number;
  name: string;
  category: string;
  value: number;
  dueDate: string;
}

@Component({
  selector: 'app-fixed-expenses',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ReactiveFormsModule],
  templateUrl: './fixed-expenses.html'
})
export class FixedExpensesComponent implements OnInit {
  expenseForm!: FormGroup;
  showModal = false;
  editingId: number | null = null; // Armazena o ID em vez do índice

  expenses: Expense[] = [
    { id: 1, name: 'Aluguel', category: 'Moradia', value: 1200, dueDate: '05' },
    { id: 2, name: 'Plano de Saúde', category: 'Saúde', value: 450, dueDate: '10' },
    { id: 3, name: 'Netflix', category: 'Lazer', value: 55, dueDate: '15' },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.expenseForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      value: ['', [Validators.required, Validators.min(0.01)]],
      dueDate: ['', [Validators.required, Validators.min(1), Validators.max(31)]],
    });
  }

  getCategoryClass(category: string): string {
    const colors: { [key: string]: string } = {
      'Moradia': 'bg-blue-100 text-blue-700 border-blue-200',
      'Saúde': 'bg-red-100 text-red-700 border-red-200',
      'Lazer': 'bg-purple-100 text-purple-700 border-purple-200',
      'Tecnologia': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Outros': 'bg-slate-100 text-slate-700 border-slate-200'
    };
    return colors[category] || colors['Outros'];
  }

  toggleModal() {
    this.showModal = !this.showModal;
    if (!this.showModal) {
      this.expenseForm.reset();
      this.editingId = null;
    }
  }

  // --- EDITAR POR ID ---
  editExpense(id: number) {
    const item = this.expenses.find(e => e.id === id);
    if (item) {
      this.editingId = id;
      this.expenseForm.patchValue(item);
      this.showModal = true;
    }
  }

  // --- EXCLUIR POR ID ---
  deleteExpense(id: number) {
    if (confirm('Tem certeza que deseja excluir esta conta?')) {
      this.expenses = this.expenses.filter(e => e.id !== id);
    }
  }

  onSubmit() {
    if (this.expenseForm.valid) {
      if (this.editingId !== null) {
        // Atualiza o item existente
        const index = this.expenses.findIndex(e => e.id === this.editingId);
        this.expenses[index] = { ...this.expenseForm.value, id: this.editingId };
      } else {
        // Cria um novo com um ID falso (simulando o banco)
        const newId = this.expenses.length > 0 ? Math.max(...this.expenses.map(e => e.id)) + 1 : 1;
        this.expenses.push({ ...this.expenseForm.value, id: newId });
      }
      this.toggleModal();
    }
  }
}