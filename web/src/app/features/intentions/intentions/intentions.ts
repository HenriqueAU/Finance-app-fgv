import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';

export interface BuyIntention {
  id: number;
  name: string;
  category: string;
  value: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  priority: 'ALTA' | 'MEDIA' | 'BAIXA';
}

@Component({
  selector: 'app-intentions',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ReactiveFormsModule],
  templateUrl: './intentions.html'
})
export class IntentionsComponent implements OnInit {
  intentionForm!: FormGroup;
  showModal = false;
  editingId: number | null = null;

  // Mock com os diferentes status para visualização
  intentions: BuyIntention[] = [
    { id: 1, name: 'PlayStation 5 Pro', category: 'Lazer', value: 3500, status: 'PENDING', priority: 'ALTA' },
    { id: 2, name: 'Sofá Novo', category: 'Moradia', value: 1200, status: 'APPROVED', priority: 'MEDIA' },
    { id: 3, name: 'Relógio Smart', category: 'Tecnologia', value: 450, status: 'REJECTED', priority: 'BAIXA' },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.intentionForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      value: ['', [Validators.required, Validators.min(0.01)]],
      priority: ['MEDIA', Validators.required],
    });
  }

  // Cores dinâmicas para o Status na tabela
  getStatusClass(status: string): string {
    const classes = {
      'PENDING': 'bg-amber-100 text-amber-700 border-amber-200',
      'APPROVED': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'REJECTED': 'bg-rose-100 text-rose-700 border-rose-200',
    };
    return classes[status as keyof typeof classes] || 'bg-slate-100 text-slate-700';
  }

  // Traduções simples para a tela
  translateStatus(status: string): string {
    const translation = { 'PENDING': 'Em Análise', 'APPROVED': 'Aprovada', 'REJECTED': 'Reprovada' };
    return translation[status as keyof typeof translation] || status;
  }

  toggleModal() {
    this.showModal = !this.showModal;
    if (!this.showModal) {
      this.intentionForm.reset({ priority: 'MEDIA' });
      this.editingId = null;
    }
  }

  // --- MUDANÇA DE STATUS RÁPIDA ---
  updateStatus(id: number, newStatus: 'APPROVED' | 'REJECTED') {
    const item = this.intentions.find(i => i.id === id);
    if (item) {
      item.status = newStatus;
    }
  }

  editIntention(id: number) {
    const item = this.intentions.find(i => i.id === id);
    if (item) {
      this.editingId = id;
      this.intentionForm.patchValue(item);
      this.showModal = true;
    }
  }

  deleteIntention(id: number) {
    if (confirm('Tem certeza que deseja excluir esta intenção de compra?')) {
      this.intentions = this.intentions.filter(i => i.id !== id);
    }
  }

  onSubmit() {
    if (this.intentionForm.valid) {
      if (this.editingId !== null) {
        // Atualiza, preservando o status que já existia
        const index = this.intentions.findIndex(i => i.id === this.editingId);
        this.intentions[index] = { ...this.intentions[index], ...this.intentionForm.value };
      } else {
        // Todo desejo novo nasce como "Pendente"
        const newId = this.intentions.length > 0 ? Math.max(...this.intentions.map(i => i.id)) + 1 : 1;
        this.intentions.push({ ...this.intentionForm.value, id: newId, status: 'PENDING' });
      }
      this.toggleModal();
    }
  }
}