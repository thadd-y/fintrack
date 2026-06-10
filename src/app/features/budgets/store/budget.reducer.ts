import { createReducer, on } from '@ngrx/store';
import { Budget } from '../models/budget.model';
import * as BudgetActions from './budget.action';

export interface BudgetState {
  budgets: Budget[];
  loading: boolean;
  error: string | null;
}

const initialState: BudgetState = {
  budgets: [],
  loading: false,
  error: null,
};

export const budgetReducer = createReducer(
  initialState,

  on(BudgetActions.loadBudgets, state => ({
    ...state, loading: true, error: null
  })),

  on(BudgetActions.loadBudgetsSuccess, (state, { budgets }) => ({
    ...state, budgets, loading: false
  })),

  on(BudgetActions.loadBudgetsFailure, (state, { error }) => ({
    ...state, error, loading: false
  })),

  on(BudgetActions.addBudgetSuccess, (state, { budget }) => ({
    ...state, budgets: [...state.budgets, budget]
  })),

  on(BudgetActions.deleteBudgetSuccess, (state, { id }) => ({
    ...state, budgets: state.budgets.filter(b => b.id !== id)
  }))
);