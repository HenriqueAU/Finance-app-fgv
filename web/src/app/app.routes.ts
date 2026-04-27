import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { DashboardComponent as Dashboard} from './features/dashboard/dashboard/dashboard';
import { FixedExpensesComponent } from './features/fixed-expenses/fixed-expenses/fixed-expenses';
import { InstallmentsComponent } from './features/installments/installments/installments';
//import { AuthGuard } from './core/guards/auth.guard'; // <-- Importe o AuthGuard

export const routes: Routes = [
  { path: 'login', component: Login }, 
  { path: 'register', component: Register }, 
  { path: 'dashboard', component: Dashboard, }, //canActivate: [AuthGuard] }, // <-- Protege a rota do dashboard
  { path: 'contas-fixas', component: FixedExpensesComponent },
  { path: 'parcelamentos', component: InstallmentsComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' } 
];