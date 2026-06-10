import { createReducer, on } from '@ngrx/store';
import { Transaction } from '../transaction.model';
import * as TransactionActions from './transaction.actions';

export interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

const initialState: TransactionState = {
  transactions: [],
  loading: false,
  error: null,
};

export const transactionReducer = createReducer(
  initialState,

  on(TransactionActions.loadTransactions, state => ({
    ...state,
    loading: true,
    error: null
  })),

  on(TransactionActions.loadTransactionsSuccess, (state, { transactions }) => ({
    ...state,
    transactions,
    loading: false
  })),

  on(TransactionActions.loadTransactionsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),

  on(TransactionActions.addTransactionSuccess, (state, { transaction }) => ({
    ...state,
    transactions: [...state.transactions, transaction]
  })),

  on(TransactionActions.deleteTransactionSuccess, (state, { id }) => ({
    ...state,
    transactions: state.transactions.filter(t => t.id !== id)
  }))
);