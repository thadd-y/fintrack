import { createAction, props } from '@ngrx/store';
import { Transaction } from '../transaction.model';

export const loadTransactions = createAction('[Transactions] Load');
export const loadTransactionsSuccess = createAction(
  '[Transactions] Load Success',
  props<{ transactions: Transaction[] }>()
);
export const loadTransactionsFailure = createAction(
  '[Transactions] Load Failure',
  props<{ error: string }>()
);

export const addTransaction = createAction(
  '[Transactions] Add',
  props<{ transaction: Omit<Transaction, 'id'> }>()
);
export const addTransactionSuccess = createAction(
  '[Transactions] Add Success',
  props<{ transaction: Transaction }>()
);

export const deleteTransaction = createAction(
  '[Transactions] Delete',
  props<{ id: string }>()
);
export const deleteTransactionSuccess = createAction(
  '[Transactions] Delete Success',
  props<{ id: string }>()
);