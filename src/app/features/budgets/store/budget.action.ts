import { createAction, props } from '@ngrx/store';
import { Budget } from '../models/budget.model';

export const loadBudgets = createAction('[Budgets] Load');

export const loadBudgetsSuccess = createAction(
    '[Budgets] Load Success',
    props<{ budgets: Budget[] }>()
);

export const loadBudgetsFailure = createAction(
    '[Budgets] Load Failure',
    props<{ error: string }>()
);

export const addBudget = createAction(
    '[Budgets] Add',
    props<{ budget: Omit<Budget, 'id' | 'created_at'> }>()
);

export const addBudgetSuccess = createAction(
    '[Budgets] Add Success',
    props<{ budget: Budget }>()
);

export const deleteBudget = createAction(
    '[Budgets] Delete',
    props<{ id: string }>()
);

export const deleteBudgetSuccess = createAction(
    '[Budgets] Delete Success',
    props<{ id: string }>()
);