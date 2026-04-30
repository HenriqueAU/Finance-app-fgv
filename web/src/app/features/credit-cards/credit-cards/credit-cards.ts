import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { CreditCardService, CreditCard } from '../../../core/services/credit-cards.service';

@Component({
  selector: 'app-credit-cards',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent],
  templateUrl: './credit-cards.html'
})
export class CreditCardsComponent implements OnInit {
  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;

  cards: CreditCard[] = [];
  isLoading: boolean = true;
  isSubmitting: boolean = false;

  isModalOpen: boolean = false;
  editingCardId: string | null = null;
  cardForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private creditCardService: CreditCardService,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadCards();
  }

  initForm(): void {
    // Formulário rigorosamente alinhado ao CreateCreditCardDto (NestJS)
    this.cardForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
      limit: [null, [Validators.required, Validators.min(0)]],
      closing_day: [null, [Validators.required, Validators.min(1), Validators.max(31)]],
      payment_due_day: [null, [Validators.required, Validators.min(1), Validators.max(31)]]
    });
  }

  loadCards(): void {
    this.isLoading = true;
    this.creditCardService.getAll().subscribe({
      next: (data: CreditCard[]) => {
        this.cards = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erro ao carregar cartões', err);
        this.isLoading = false;
      }
    });
  }

  openModal(card?: CreditCard): void {
    if (card) {
      this.editingCardId = card.id;
      // O patchValue agora vai bater certinho com as chaves que vêm do banco
      this.cardForm.patchValue(card);
    } else {
      this.editingCardId = null;
      this.cardForm.reset();
    }
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.cardForm.reset();
    this.editingCardId = null;
  }

  saveCard(): void {
    if (this.cardForm.invalid) return;

    this.isSubmitting = true;
    const cardData = {
      ...this.cardForm.value,
      limit: Number(this.cardForm.value.limit)
    };;

    const request$ = this.editingCardId
      ? this.creditCardService.update(this.editingCardId, cardData)
      : this.creditCardService.create(cardData);

    request$.subscribe({
      next: () => {
        this.loadCards();
        this.closeModal();
        this.isSubmitting = false;
      },
      error: (err: any) => {
        console.error('Erro ao salvar', err);
        this.isSubmitting = false;
      }
    });
  }

  deleteCard(id: string): void {
    if (confirm('Tem certeza que deseja remover este cartão? O histórico de faturas pode ser afetado.')) {
      this.creditCardService.delete(id).subscribe({
        next: () => this.loadCards(),
        error: (err: any) => console.error('Erro ao deletar', err)
      });
    }
  }

  toggleSidebar(): void {
    if (this.sidebar) {
      this.sidebar.toggleSidebar();
    }
  }

}
