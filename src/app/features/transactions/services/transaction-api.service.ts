import { Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { supabase } from '../../../core/supabase/supabase.client';
import { Transaction } from '../transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionApiService {

    getAll(): Observable<Transaction[]> {
        return from(
            supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: false })
        ).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return (data ?? []) as Transaction[];
            })
        );
    }

    create(transaction: Omit<Transaction, 'id' | 'created_at'>): Observable<Transaction> {
        return from(
            supabase
                .from('transactions')
                .insert(transaction)
                .select()
                .single()
        ).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return data as Transaction;
            })
        );
    }

    remove(id: string): Observable<void> {
        return from(
            supabase
                .from('transactions')
                .delete()
                .eq('id', id)
        ).pipe(
            map(({ error }) => {
                if (error) throw error;
            })
        );
    }
}