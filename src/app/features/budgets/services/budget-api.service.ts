import { Injectable, inject } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { supabase } from '../../../core/supabase/supabase.client';
import { Budget } from '../models/budget.model';
import { AuthService } from '../../../core/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class BudgetApiService {
    private auth = inject(AuthService);

    getBudgets(): Observable<Budget[]> {
        return from(
            supabase
                .from('budgets')
                .select('*')
                .order('created_at', { ascending: false })
        ).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return data as Budget[];
            })
        );
    }

    createBudget(budget: Omit<Budget, 'id' | 'created_at'>): Observable<Budget> {
        const user_id = this.auth.currentUser?.id ?? '';
        return from(
            supabase
                .from('budgets')
                .insert([{ ...budget, user_id }])
                .select()
                .single()
        ).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return data as Budget;
            })
        );
    }

    deleteBudget(id: string): Observable<void> {
        return from(
            supabase.from('budgets').delete().eq('id', id)
        ).pipe(
            map(({ error }) => {
                if (error) throw error;
            })
        );
    }
}