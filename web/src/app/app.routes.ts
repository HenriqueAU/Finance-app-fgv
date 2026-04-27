import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Dashboard } from './features/dashboard/dashboard';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: 'login', component: Login }, 
  { path: 'register', component: Register }, 
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] }, 
  { path: '', redirectTo: '/login', pathMatch: 'full' } // Redireciona para login ao abrir o app
];