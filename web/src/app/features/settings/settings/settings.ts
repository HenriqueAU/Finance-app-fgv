import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  showSuccessMessage = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit() {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      monthlySalary: [0, [Validators.required, Validators.min(1)]],
      payday: [null, [Validators.min(1), Validators.max(31)]]
    });

    this.authService.getMe().subscribe((user) => {
      this.profileForm.patchValue({
        name: user.name,
        email: user.email,
        monthlySalary: user.salary,
        payday: user.payday
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
  if (this.profileForm.invalid) return;

  const { name, email, monthlySalary, payday } = this.profileForm.value;

  this.authService.updateProfile({ name, email }).subscribe();
  this.authService.updateSalary({ salary: Number(monthlySalary), payday }).subscribe({
    next: () => this.triggerSuccess(),
    error: () => alert('Erro ao salvar!')
  });
}

  private triggerSuccess() {
    this.showSuccessMessage = true;
    setTimeout(() => this.showSuccessMessage = false, 3000);
  }
}
