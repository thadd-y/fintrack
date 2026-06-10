import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { ShellComponent } from './shared/components/shell/shell.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
      },
      {
        path: 'transactions',
        loadChildren: () =>
          import('./features/transactions/transactions.routes').then(m => m.TRANSACTION_ROUTES)
      },
      {
        path: 'budgets',
        loadChildren: () =>
          import('./features/budgets/budgets.routes').then(m => m.BUDGET_ROUTES)
      }
    ]
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./core/auth/login.component').then(m => m.LoginComponent)
  },
  { path: '**', redirectTo: '' }
];