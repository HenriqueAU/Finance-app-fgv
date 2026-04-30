import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';

// Ajuste os caminhos conforme o seu projeto
import { IntentionService } from '../../../core/services/intention.service';
import { CategoriesService, Category } from '../../../core/services/categories.service';

interface Intention {
  id: string;
  description: string;
  amount: number;
  status: 'pendente' | 'aprovada' | 'rejeitada' | 'cancelada';
  category: string;
  categoryColor: string;
  categoryId?: string;
}

@Component({
  selector: 'app-intentions',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ReactiveFormsModule],
  templateUrl: './intentions.html'
})
export class IntentionsComponent implements OnInit {
  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;

  intentionForm!: FormGroup;
  inlineCategoryForm!: FormGroup;
  
  intentions: Intention[] = [];
  categories: Category[] = [];
  
  showModal = false;
  showInlineCategory = false;
  isSavingCategory = false;
  isLoading = true;
  editingId: string | null = null;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private intentionsService: IntentionService,
    private categoriesService: CategoriesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadData();
  }

  initForm() {
    this.intentionForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(3)]],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      categoryId: [null],
      status: ['pendente', Validators.required]
    });

    this.inlineCategoryForm = this.fb.group({
      name: ['', Validators.required],
      color: ['#F59E0B', Validators.required] // Começa com um tom de "Desejo/Ouro"
    });
  }

  loadData() {
    this.isLoading = true;

    // Carrega Categorias
    this.categoriesService.getAll().subscribe(data => this.categories = data);

    // Carrega Intenções
    this.intentionsService.getAll().subscribe({
      next: (data: any[]) => {
        this.intentions = data.map(item => this.mapToFrontend(item));
        this.isLoading = false;
        this.cdr.detectChanges(); // Atualiza a tela instantaneamente
      },
      error: (err: any) => {
        console.error('Erro ao buscar intenções:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private mapToFrontend(item: any): Intention {
    // 1. Trocamos o 'const' pelo 'let' aqui! 👇
    let rawStatus = (item.status || 'pending').trim().toLowerCase();

    // 2. Agora o TypeScript permite que a gente altere a variável à vontade:
    if (rawStatus === 'pending') rawStatus = 'pendente';
    if (rawStatus === 'approved') rawStatus = 'aprovada';
    if (rawStatus === 'rejected') rawStatus = 'rejeitada';
    if (rawStatus === 'canceled') rawStatus = 'cancelada';

    return {
      id: item.id,
      description: item.description,
      amount: Number(item.installment_amount), 
      status: rawStatus, 
      category: item.category?.name || 'Geral',
      categoryColor: item.category?.color || '#cbd5e1',
      categoryId: item.category?.id
    };
  }

  toggleInlineCategory() {
    this.showInlineCategory = !this.showInlineCategory;
    if (!this.showInlineCategory) this.inlineCategoryForm.reset({ color: '#F59E0B' });
  }

  saveInlineCategory() {
    if (this.inlineCategoryForm.invalid) return;
    
    const newCategoryName = this.inlineCategoryForm.value.name.trim();

    // Tratamento de duplicidade no frontend
    const existingCategory = this.categories.find(
      cat => cat.name.toLowerCase() === newCategoryName.toLowerCase()
    );

    if (existingCategory) {
      alert(`Você já tem uma categoria chamada "${existingCategory.name}". Vou selecioná-la para você!`);
      this.intentionForm.patchValue({ categoryId: existingCategory.id });
      this.toggleInlineCategory();
      return; 
    }

    this.isSavingCategory = true;
    const payload = {
      ...this.inlineCategoryForm.value,
      name: newCategoryName,
      is_essential: false
    };

    this.categoriesService.create(payload).subscribe({
      next: (newCategory) => {
        this.categories = [...this.categories, newCategory];
        this.intentionForm.patchValue({ categoryId: newCategory.id });
        this.toggleInlineCategory();
        this.isSavingCategory = false;
      },
      error: (err) => {
        console.error('Erro ao criar categoria:', err);
        alert('Erro ao salvar categoria no servidor.');
        this.isSavingCategory = false;
      }
    });
  }

  onSubmit() {
    if (this.intentionForm.invalid) {
      this.intentionForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true; 
    const formValues = this.intentionForm.value;

    // Formato exato exigido pelo Regex: YYYY-MM
    const today = new Date();
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const payload: any = {
      description: formValues.description,
      installment_amount: Number(formValues.amount),
      months: 1, 
      desired_start_month: monthStr, // <--- O VERDADEIRO NOME DA CHAVE!
    };

    // Caso o seu backend aceite o status na hora de criar/atualizar
    if (formValues.status) {
      payload.status = formValues.status;
    }

    if (formValues.categoryId && formValues.categoryId !== 'null') {
      payload.categoryId = formValues.categoryId; 
    }

    const request$ = this.editingId 
      ? this.intentionsService.update(this.editingId, payload)
      : this.intentionsService.create(payload);

    request$.subscribe({
      next: () => {
        this.loadData(); 
        this.toggleModal();
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Erro ao salvar intenção:', err);
        alert('Erro ao salvar. Verifique o console do navegador.');
        this.isSubmitting = false;
      }
    });
  }

  simulateIntention(item: Intention) {
    // Aqui vai a chamada pro seu backend de simulação no futuro!
    alert(`Simulando a compra de: ${item.description} (${item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}). \n\nEm breve o motor de viabilidade estará conectado aqui!`);
  }

  deleteIntention(id: string) {
    if (confirm('Deseja realmente excluir esta intenção de compra?')) {
      this.intentionsService.remove(id).subscribe(() => this.loadData());
    }
  }

  editIntention(id: string) {
    const item = this.intentions.find(i => i.id === id);
    if (item) {
      this.editingId = id;
      this.intentionForm.patchValue(item);
      this.showModal = true;
    }
  }

  toggleModal() {
    this.showModal = !this.showModal;
    if (!this.showModal) {
      this.intentionForm.reset({ status: 'pendente' });
      this.editingId = null;
    }
  }

  toggleSidebar(): void {
    if (this.sidebar) {
      this.sidebar.toggleSidebar();
    }
  }
}