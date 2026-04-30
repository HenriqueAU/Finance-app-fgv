import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ReactiveFormsModule],
  templateUrl: './settings.html'
})
export class SettingsComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  showSuccessMessage = false;
  isSidebarVisible = true;

  toggleSidebar() {
  this.isSidebarVisible = !this.isSidebarVisible;
}

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      monthlySalary: [0, [Validators.required, Validators.min(0)]],
      payday: [null, [Validators.min(1), Validators.max(31)]],
      savings: [0, [Validators.min(0)]],
      emergency_reserve: [0, [Validators.min(0)]]
    });

    this.passwordForm = this.fb.group({
      current_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.authService.getMe().subscribe((user) => {
      this.profileForm.patchValue({
        name: user.name,
        email: user.email,
        monthlySalary: user.salary,
        payday: user.payday,
        savings: user.savings || 0,
        emergency_reserve: user.emergency_reserve || 0
      });
    });
  }

  get currentName(): string {
    return this.profileForm.get('name')?.value || 'Usuário';
  }

  get currentEmail(): string {
    return this.profileForm.get('email')?.value || 'E-mail não informado';
  }

  saveProfile() {
    if (this.profileForm.invalid) {
      alert('Formulário inválido! Verifique se todos os campos estão preenchidos corretamente.');
      return;
    }

    const { name, email, monthlySalary, payday, savings, emergency_reserve } = this.profileForm.value;
    const validPayday = payday ? Number(payday) : null;

    // Fila de atualizações sequenciais
    this.authService.updateProfile({ name, email }).subscribe({
      next: () => {
        this.authService.updateSavings({ savings: Number(savings) }).subscribe({
          next: () => {
            // Nova requisição para a Reserva de Emergência
            this.authService.updateEmergencyReserve({ emergency_reserve: Number(emergency_reserve) }).subscribe({
              next: () => {
                this.authService.updateSalary({ salary: Number(monthlySalary), payday: validPayday }).subscribe({
                  next: () => this.triggerSuccess(),
                  error: () => alert('Erro ao salvar o salário!')
                });
              },
              error: () => alert('Erro ao salvar a reserva de emergência.')
            });
          },
          error: () => alert('Erro ao salvar as economias.')
        });
      },
      error: () => alert('Erro ao salvar o perfil.')
    });
  }

  changePassword() {
    if (this.passwordForm.invalid) return;
    
    this.authService.updatePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.triggerSuccess();
        this.passwordForm.reset();
      },
      error: (err) => alert(err.error?.message || 'Erro ao alterar senha. Verifique sua senha atual.')
    });
  }

  deleteAccount() {
    const isSure = confirm('🚨 TEM CERTEZA ABSOLUTA?\n\nIsso apagará permanentemente todos os seus dados e não poderá ser desfeito.');
    
    if (isSure) {
      this.authService.deleteAccount().subscribe({
        next: () => {
          this.authService.logout();
          this.router.navigate(['/login']);
        },
        error: () => alert('Erro ao deletar a conta.')
      });
    }
  }

  private triggerSuccess() {
    this.showSuccessMessage = true;
    setTimeout(() => this.showSuccessMessage = false, 3000);
  }
}
