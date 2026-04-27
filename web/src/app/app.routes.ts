import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { DashboardComponent as Dashboard} from './features/dashboard/dashboard/dashboard';
//import { AuthGuard } from './core/guards/auth.guard'; // <-- Importe o AuthGuard

export const routes: Routes = [
  { path: 'login', component: Login }, 
  { path: 'register', component: Register }, 
  { path: 'dashboard', component: Dashboard, }, //canActivate: [AuthGuard] }, // <-- Protege a rota do dashboard
  { path: '', redirectTo: '/login', pathMatch: 'full' } // Redireciona para login ao abrir o app
];