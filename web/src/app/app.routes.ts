import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { DashboardComponent as Dashboard} from './features/dashboard/dashboard/dashboard';
import { FixedExpensesComponent } from './features/fixed-expenses/fixed-expenses/fixed-expenses';
import { InstallmentsComponent } from './features/installments/installments/installments';
import { IntentionsComponent } from './features/intentions/intentions/intentions';
import { SettingsComponent } from './features/settings/settings/settings';
import { authGuard } from './core/guards/auth-guard';
import { CreditCardsComponent } from './features/credit-cards/credit-cards/credit-cards';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'contas-fixas', component: FixedExpensesComponent, canActivate: [authGuard] },
  { path: 'parcelamentos', component: InstallmentsComponent, canActivate: [authGuard] },
  { path: 'intencoes', component: IntentionsComponent, canActivate: [authGuard] },
  { path: 'cartoes', component: CreditCardsComponent, canActivate: [authGuard] },
  { path: 'configuracoes', component: SettingsComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
