import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ReactiveFormsModule],
  templateUrl: './settings.html'
})
export class SettingsComponent implements OnInit {
  profileForm!: FormGroup;
  showSuccessMessage = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    // Apenas o formulário de Perfil e Renda
    this.profileForm = this.fb.group({
      name: ['Maria Silva', Validators.required],
      email: ['maria.silva@email.com', [Validators.required, Validators.email]],
      monthlySalary: [5000, [Validators.required, Validators.min(1)]]
    });
  }

  // Getters para a tela atualizar em tempo real
  get currentName(): string {
    return this.profileForm.get('name')?.value || 'Usuário';
  }

  get currentEmail(): string {
    return this.profileForm.get('email')?.value || 'E-mail não informado';
  }

  // Função de Salvar única
  saveProfile() {
    if (this.profileForm.valid) {
      console.log('✅ Perfil salvo no banco de dados:', this.profileForm.value);
      this.triggerSuccess();
    }
  }

  // Dispara o alerta visual verde
  private triggerSuccess() {
    this.showSuccessMessage = true;
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);
  }
}