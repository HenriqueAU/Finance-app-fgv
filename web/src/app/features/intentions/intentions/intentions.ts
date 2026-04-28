import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { IntentionService, Intention } from '../../../core/services/intention.service';

@Component({
  selector: 'app-intentions',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ReactiveFormsModule],
  templateUrl: './intentions.html'
})
export class IntentionsComponent implements OnInit {
  intentionForm!: FormGroup;
  showModal = false;
  editingId: string | null = null;
  isLoading = false;

  intentions: Intention[] = [];

  constructor(
    private fb: FormBuilder,
    private intentionService: IntentionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadIntentions();
  }

  initForm() {
    this.intentionForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      categoryId: [null], 
      installment_amount: ['', [Validators.required, Validators.min(0)]],
      months: ['', [Validators.required, Validators.min(1), Validators.max(60)]],
      desired_start_month: ['', [Validators.required, Validators.pattern(/^\d{4}-(0[1-9]|1[0-2])$/)]],
    });
  }

  loadIntentions() {
    this.isLoading = true;
    this.intentionService.getAll().subscribe({
      next: (data) => {
        this.intentions = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar intenções:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateStatus(id: string, newStatus: 'APPROVED' | 'REJECTED') {
    const request$ = newStatus === 'APPROVED' 
      ? this.intentionService.approve(id) 
      : this.intentionService.postpone(id);

    request$.subscribe({
      next: () => this.loadIntentions(),
      error: (err) => console.error('Erro ao atualizar status:', err)
    });
  }

  deleteIntention(id: string) {
    if (confirm('Tem certeza que deseja excluir esta intenção de compra?')) {
      this.intentionService.remove(id).subscribe({
        next: () => this.loadIntentions(),
        error: (err) => console.error('Erro ao excluir:', err)
      });
    }
  }

  onSubmit() {
    if (this.intentionForm.invalid) return;

    const payload = this.intentionForm.value;

    const request$ = this.editingId
      ? this.intentionService.update(this.editingId, payload)
      : this.intentionService.create(payload);

    request$.subscribe({
      next: () => {
        this.loadIntentions();
        this.toggleModal();
      },
      error: (err) => console.error('Erro ao salvar intenção:', err)
    });
  }

  toggleModal() {
    this.showModal = !this.showModal;
    if (!this.showModal) {
      this.intentionForm.reset();
      this.editingId = null;
    }
  }

  editIntention(id: string) {
    const item = this.intentions.find(i => i.id === id);
    if (item) {
      this.editingId = id;
      
      // Fix do formato da data para o input do Chrome não quebrar
      let monthStr = item.desired_start_month;
      if (monthStr && monthStr.length > 7) {
        monthStr = monthStr.substring(0, 7);
      }

      this.intentionForm.patchValue({
        description: item.description,
        installment_amount: item.installment_amount,
        months: item.months,
        desired_start_month: monthStr,
        categoryId: item.categoryId
      });
      
      this.showModal = true;
    }
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return 'bg-slate-100 text-slate-700';
    
    // Força para maiúsculo para evitar bugs de digitação do back-end
    const safeStatus = status.toUpperCase(); 
    
    const classes = {
      'PENDING': 'bg-amber-100 text-amber-700 border-amber-200', // Voltei pro laranjinha padrão
      'APPROVED': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'REJECTED': 'bg-rose-100 text-rose-700 border-rose-200',
    };
    return classes[safeStatus as keyof typeof classes] || 'bg-slate-100 text-slate-700';
  }

  translateStatus(status: string | undefined): string {
    if (!status) return 'Desconhecido';
    
    const safeStatus = status.toUpperCase();
    
    const translation = { 'PENDING': 'Em Análise', 'APPROVED': 'Aprovada', 'REJECTED': 'Reprovada' };
    return translation[safeStatus as keyof typeof translation] || status;
  }
}