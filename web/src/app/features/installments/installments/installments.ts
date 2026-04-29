import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';

export interface Installment {
  id: number;
  name: string;
  category: string;
  monthlyValue: number; // Foco no valor da parcela
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
  editingId: number | null = null;

  installments: Installment[] = [
    { id: 1, name: 'iPhone 15', category: 'Eletrônicos', monthlyValue: 416.66, currentParcel: 4, totalParcels: 12 },
    { id: 2, name: 'IPVA 2026', category: 'Impostos', monthlyValue: 300, currentParcel: 1, totalParcels: 5 },
    { id: 3, name: 'Curso de Inglês', category: 'Educação', monthlyValue: 200, currentParcel: 12, totalParcels: 12 },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.installmentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      monthlyValue: ['', [Validators.required, Validators.min(0.01)]],
      currentParcel: ['', [Validators.required, Validators.min(1)]],
      totalParcels: ['', [Validators.required, Validators.min(1)]],
    });
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

  editInstallment(id: number) {
    const item = this.installments.find(i => i.id === id);
    if (item) {
      this.editingId = id;
      this.installmentForm.patchValue(item);
      this.showModal = true;
    }
  }

  deleteInstallment(id: number) {
    if (confirm('Deseja remover este parcelamento?')) {
      this.installments = this.installments.filter(i => i.id !== id);
    }
  }

  onSubmit() {
    if (this.installmentForm.valid) {
      if (this.editingId !== null) {
        const index = this.installments.findIndex(i => i.id === this.editingId);
        this.installments[index] = { ...this.installmentForm.value, id: this.editingId };
      } else {
        const newId = this.installments.length > 0 ? Math.max(...this.installments.map(i => i.id)) + 1 : 1;
        this.installments.push({ ...this.installmentForm.value, id: newId });
      }
      this.toggleModal();
    }
  }

  toggleSidebar(): void {
    if (this.sidebar) {
      this.sidebar.toggleSidebar();
    }
  }

}