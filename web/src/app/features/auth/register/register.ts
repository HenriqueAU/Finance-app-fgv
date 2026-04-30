import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.html'
})

export class Register {
  form = { name: '', email: '', password: '', salary: 0, emergency_reserve: 0, payday: 5 };

  toggleDarkMode() {
  // Adiciona ou remove a classe 'dark' no elemento raiz (html)
  document.documentElement.classList.toggle('dark');
  
  // Opcional: Salva a preferência no localStorage para persistir
  const isDark = document.documentElement.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}
  constructor(private authService: AuthService, private router: Router) {}

  handleRegister() {
    this.authService.register(this.form).subscribe({
    next: () => {
      alert('Conta criada!');
      this.router.navigate(['/login']);
    },
    error: () => alert('Erro no cadastro!')
    });
  }
}
