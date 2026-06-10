export interface Budget {
    id: string;
    user_id: string;
    name: string;
    category: string;
    limit: number;
    period: 'monthly' | 'weekly' | 'yearly';
    created_at: string;
}

export interface BudgetWithSpend extends Budget {
    spent: number;
    remaining: number;
    percentage: number;
    status: 'safe' | 'warning' | 'over';
}

export type BudgetPeriod = 'monthly' | 'weekly' | 'yearly';

export function getBudgetStatus(percentage: number): 'safe' | 'warning' | 'over' {
    if (percentage >= 100) return 'over';
    if (percentage >= 85) return 'warning';
    return 'safe';
}