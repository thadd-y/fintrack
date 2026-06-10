import { Routes } from '@angular/router';

export const TRANSACTION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./transactions.component').then(m => m.TransactionsComponent)
  }
];