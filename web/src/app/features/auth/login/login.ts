import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html'
})
export class Login {
  email = '';
  password = '';

  toggleDarkMode() {
  // Adiciona ou remove a classe 'dark' no elemento raiz (html)
  document.documentElement.classList.toggle('dark');
  
  // Opcional: Salva a preferência no localStorage para persistir
  const isDark = document.documentElement.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

  constructor(private authService: AuthService, private router: Router) {}

  handleLogin() {
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => alert('Credenciais inválidas!')
    });
  }
}