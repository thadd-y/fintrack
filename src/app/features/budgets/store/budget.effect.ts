import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, map, catchError, of } from 'rxjs';
import { BudgetApiService } from '../services/budget-api.service';
import * as BudgetActions from './budget.action';

@Injectable()
export class BudgetEffects {
    private actions$ = inject(Actions);
    private api = inject(BudgetApiService);

    loadBudgets$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BudgetActions.loadBudgets),
            switchMap(() =>
                this.api.getBudgets().pipe(
                    map(budgets => BudgetActions.loadBudgetsSuccess({ budgets })),
                    catchError(err => of(BudgetActions.loadBudgetsFailure({ error: err.message })))
                )
            )
        )
    );

    addBudget$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BudgetActions.addBudget),
            switchMap(({ budget }) =>
                this.api.createBudget(budget).pipe(
                    map(newBudget => BudgetActions.addBudgetSuccess({ budget: newBudget })),
                    catchError(err => of(BudgetActions.loadBudgetsFailure({ error: err.message })))
                )
            )
        )
    );

    deleteBudget$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BudgetActions.deleteBudget),
            switchMap(({ id }) =>
                this.api.deleteBudget(id).pipe(
                    map(() => BudgetActions.deleteBudgetSuccess({ id })),
                    catchError(err => of(BudgetActions.loadBudgetsFailure({ error: err.message })))
                )
            )
        )
    );
}