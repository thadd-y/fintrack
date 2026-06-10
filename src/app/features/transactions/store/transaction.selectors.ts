import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TransactionState } from './transaction.reducer';

// Get the entire transactions slice
const selectTransactionState = createFeatureSelector<TransactionState>('transactions');

// Get just the array
export const selectAllTransactions = createSelector(
  selectTransactionState,
  state => state.transactions
);

// Get loading state
export const selectTransactionsLoading = createSelector(
  selectTransactionState,
  state => state.loading
);

// Get only expenses
export const selectExpenses = createSelector(
  selectAllTransactions,
  transactions => transactions.filter(t => t.type === 'expense')
);

// Get only income
export const selectIncome = createSelector(
  selectAllTransactions,
  transactions => transactions.filter(t => t.type === 'income')
);

// Calculate total balance
export const selectBalance = createSelector(
  selectAllTransactions,
  transactions =>
    transactions.reduce((acc, t) => {
      return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0)
);