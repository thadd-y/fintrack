import { TransactionState } from '../features/transactions/store/transaction.reducer';
import { BudgetState } from '../features/budgets/budget.reducer';

export interface AppState {
  transactions: TransactionState;
  budgets: BudgetState;
}