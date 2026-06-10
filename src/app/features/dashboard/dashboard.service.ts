import { Injectable, inject, NgZone } from '@angular/core';
import { from, forkJoin, Observable, map } from 'rxjs';
import { supabase } from '../../core/supabase/supabase.client';
import { Transaction } from '../transactions/transaction.model';

export interface DashboardStats {
    balance: number;
    totalIncome: number;
    totalExpenses: number;
    transactionCount: number;
    savingsRate: number;
    largestExpense: Transaction | null;
    balanceChangePercent: number | null;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private zone = inject(NgZone);

    getDashboardData(): Observable<{
        stats: DashboardStats;
        recentTransactions: Transaction[];
        monthlyChart: { month: string; income: number; expenses: number; isCurrent: boolean }[];
        categoryBreakdown: { category: string; amount: number; color: string }[];
    }> {
        const now = new Date();
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().split('T')[0];

        return new Observable(observer => {
            this.zone.runOutsideAngular(async () => {
                try {
                    const [thisMonth, lastMonth, recent, chart] = await Promise.all([
                        supabase.from('transactions').select('*').gte('date', firstOfMonth).order('date', { ascending: false }),
                        supabase.from('transactions').select('*').gte('date', firstOfLastMonth).lt('date', firstOfMonth),
                        supabase.from('transactions').select('*').order('date', { ascending: false }).limit(5),
                        supabase.from('transactions').select('*').gte('date', sixMonthsAgo).order('date', { ascending: true }),
                    ]);

                    console.log('thisMonth', thisMonth);
                    console.log('lastMonth', lastMonth);
                    console.log('recent', recent);
                    console.log('chart', chart);

                    const monthTxs: Transaction[] = thisMonth.data ?? [];
                    const lastMonthTxs: Transaction[] = lastMonth.data ?? [];
                    const recentTxs: Transaction[] = recent.data ?? [];
                    const chartTxs: Transaction[] = chart.data ?? [];

                    const income = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
                    const expenses = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
                    const balance = income - expenses;

                    const lastIncome = lastMonthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
                    const lastExpenses = lastMonthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
                    const lastBalance = lastIncome - lastExpenses;

                    const balanceChangePercent = lastBalance !== 0
                        ? ((balance - lastBalance) / Math.abs(lastBalance)) * 100
                        : null;

                    const largestExpense = monthTxs
                        .filter(t => t.type === 'expense')
                        .sort((a, b) => b.amount - a.amount)[0] ?? null;

                    const stats: DashboardStats = {
                        balance,
                        totalIncome: income,
                        totalExpenses: expenses,
                        transactionCount: monthTxs.length,
                        savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
                        largestExpense,
                        balanceChangePercent
                    };

                    const currentMonthKey = now.toLocaleString('default', { month: 'short' });
                    const monthlyMap = new Map<string, { income: number; expenses: number; isCurrent: boolean }>();
                    for (let i = 5; i >= 0; i--) {
                        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                        const key = d.toLocaleString('default', { month: 'short' });
                        monthlyMap.set(key, { income: 0, expenses: 0, isCurrent: key === currentMonthKey });
                    }
                    chartTxs.forEach(tx => {
                        const key = new Date(tx.date).toLocaleString('default', { month: 'short' });
                        if (monthlyMap.has(key)) {
                            const entry = monthlyMap.get(key)!;
                            if (tx.type === 'income') entry.income += tx.amount;
                            else entry.expenses += tx.amount;
                        }
                    });
                    const monthlyChart = Array.from(monthlyMap.entries()).map(([month, v]) => ({ month, ...v }));

                    const categoryColors: Record<string, string> = {
                        Housing: 'var(--green)',
                        Food: 'var(--amber)',
                        Transport: 'var(--red)',
                        Entertainment: 'var(--blue)',
                        Other: 'var(--muted2)',
                    };
                    const catMap = new Map<string, number>();
                    monthTxs.filter(t => t.type === 'expense').forEach(tx => {
                        catMap.set(tx.category, (catMap.get(tx.category) ?? 0) + tx.amount);
                    });
                    const categoryBreakdown = Array.from(catMap.entries())
                        .sort((a, b) => b[1] - a[1])
                        .map(([category, amount]) => ({
                            category, amount,
                            color: categoryColors[category] ?? 'var(--muted2)'
                        }));

                    this.zone.run(() => {
                        observer.next({ stats, recentTransactions: recentTxs, monthlyChart, categoryBreakdown });
                        observer.complete();
                    });

                } catch (err) {
                    this.zone.run(() => {
                        observer.error(err);
                    });
                }
            });
        });
    }
}