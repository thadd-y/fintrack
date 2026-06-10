import { createReducer } from '@ngrx/store';

export interface BudgetState {
  budgets: any[];
  loading: boolean;
  error: string | null;
}

const initialState: BudgetState = {
  budgets: [],
  loading: false,
  error: null,
};

export const budgetReducer = createReducer(initialState);