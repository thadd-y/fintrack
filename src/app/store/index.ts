import { ActionReducerMap } from '@ngrx/store';
import { AppState } from './app.state';
import { transactionReducer } from '../features/transactions/store/transaction.reducer';
import { budgetReducer } from '../features/budgets/store/budget.reducer';

export const reducers: ActionReducerMap<AppState> = {
  transactions: transactionReducer,
  budgets: budgetReducer,
};