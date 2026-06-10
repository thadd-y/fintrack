import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BudgetState } from './budget.reducer';

const selectBudgetState = createFeatureSelector<BudgetState>('budgets');

export const selectAllBudgets = createSelector(selectBudgetState, s => s.budgets);
export const selectBudgetLoading = createSelector(selectBudgetState, s => s.loading);
export const selectBudgetError = createSelector(selectBudgetState, s => s.error);