import { Injectable, inject } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { supabase } from '../../../core/supabase/supabase.client';
import { Budget, BudgetWithSpend, getBudgetStatus } from '../models/budget.model';
import { Transaction } from '../../transactions/transaction.model';

export interface BudgetSummary {
    totalBudgeted: number;
    totalSpent: number;
    remaining: number;
    budgets: BudgetWithSpend[];
}

@Injectable({ providedIn: 'root' })
export class BudgetService {

    getBudgetSummary(budgets: Budget[]): Observable<BudgetSummary> {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

        return from(
            supabase
                .from('transactions')
                .select('*')
                .eq('type', 'expense')
                .gte('date', startDate)
                .lte('date', endDate)
        ).pipe(
            map(({ data, error }) => {
                if (error) throw error;

                const transactions = data as Transaction[];

                const budgetsWithSpend: BudgetWithSpend[] = budgets.map(budget => {
                    const spent = transactions
                        .filter(t => t.category.toLowerCase() === budget.category.toLowerCase())
                        .reduce((sum, t) => sum + t.amount, 0);

                    const percentage = Math.round((spent / budget.limit) * 100);
                    const remaining = budget.limit - spent;

                    return {
                        ...budget,
                        spent,
                        remaining,
                        percentage,
                        status: getBudgetStatus(percentage)
                    };
                });

                const totalBudgeted = budgets.reduce((s, b) => s + b.limit, 0);
                const totalSpent = budgetsWithSpend.reduce((s, b) => s + b.spent, 0);

                return {
                    totalBudgeted,
                    totalSpent,
                    remaining: totalBudgeted - totalSpent,
                    budgets: budgetsWithSpend
                };
            })
        );
    }
}