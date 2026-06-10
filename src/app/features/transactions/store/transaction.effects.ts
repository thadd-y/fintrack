import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, map, catchError, of } from 'rxjs';
import { TransactionApiService } from '../services/transaction-api.service';
import * as TransactionActions from './transaction.actions';

@Injectable()
export class TransactionEffects {
  private actions$ = inject(Actions);
  private api = inject(TransactionApiService);

  loadTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionActions.loadTransactions),
      switchMap(() =>
        this.api.getAll().pipe(
          map(transactions => TransactionActions.loadTransactionsSuccess({ transactions })),
          catchError(error => of(TransactionActions.loadTransactionsFailure({ error: error.message })))
        )
      )
    )
  );

  addTransaction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionActions.addTransaction),
      switchMap(({ transaction }) =>
        this.api.create(transaction).pipe(
          map(newTransaction => TransactionActions.addTransactionSuccess({ transaction: newTransaction })),
          catchError(error => of(TransactionActions.loadTransactionsFailure({ error: error.message })))
        )
      )
    )
  );

  deleteTransaction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionActions.deleteTransaction),
      switchMap(({ id }) =>
        this.api.remove(id).pipe(
          map(() => TransactionActions.deleteTransactionSuccess({ id })),
          catchError(error => of(TransactionActions.loadTransactionsFailure({ error: error.message })))
        )
      )
    )
  );
}