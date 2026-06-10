import { Routes } from '@angular/router';

export const BUDGET_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./budgets.component').then(m => m.BudgetsComponent)
  }
];