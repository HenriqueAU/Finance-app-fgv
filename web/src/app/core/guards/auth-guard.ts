import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // Recupera o token do localStorage [cite: 335, 340]
  const token = localStorage.getItem('access_token');

  if (token) {
    // Se o token existe, permite o acesso à rota [cite: 338]
    return true;
  } else {
    // Se não houver token, manda o usuário de volta para a tela de login [cite: 307]
    router.navigate(['/auth/login']);
    return false;
  }
};