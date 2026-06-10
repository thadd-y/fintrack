import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { DashboardService, DashboardStats } from './dashboard.service';
import { Transaction } from '../transactions/transaction.model';
import { addTransaction } from '../transactions/store/transaction.actions';
import { AppState } from '../../store/app.state';
import { AuthService } from '../../core/auth/auth.service';

interface TransactionField {
  key: string;
  label: string;
  type: string;
  placeholder: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.Default
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private store = inject(Store<AppState>);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  readonly today = new Date();

  isLoading = true;
  error: string | null = null;
  stats: DashboardStats | null = null;
  recentTransactions: Transaction[] = [];
  monthlyChart: { month: string; income: number; expenses: number; isCurrent: boolean }[] = [];
  categoryBreakdown: { category: string; amount: number; color: string }[] = [];

  showModal = false;
  selectedType: 'expense' | 'income' = 'expense';

  readonly fields: TransactionField[] = [
    { key: 'description', label: 'Description', type: 'text', placeholder: 'e.g. Grocery run' },
    { key: 'amount', label: 'Amount (R)', type: 'number', placeholder: '0.00' },
    { key: 'category', label: 'Category', type: 'text', placeholder: 'e.g. Food' },
    { key: 'date', label: 'Date', type: 'date', placeholder: '' },
  ];

  form: FormGroup = this.fb.group({
    description: ['', Validators.required],
    amount: [null, [Validators.required, Validators.min(0.01)]],
    category: ['', Validators.required],
    date: [new Date().toISOString().split('T')[0], Validators.required],
  });

  private readonly categoryMeta: Record<string, { color: string; bg: string; emoji: string }> = {
    Income: { color: 'var(--green)', bg: 'var(--green-dim)', emoji: '💼' },
    Housing: { color: 'var(--red)', bg: 'var(--red-dim)', emoji: '🏠' },
    Food: { color: 'var(--amber)', bg: 'var(--amber-dim)', emoji: '🛒' },
    Transport: { color: 'var(--red)', bg: 'var(--red-dim)', emoji: '🚗' },
    Entertainment: { color: 'var(--blue)', bg: 'var(--blue-dim)', emoji: '🎬' },
    Other: { color: 'var(--muted)', bg: 'var(--surface2)', emoji: '📦' },
  };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.error = null;

    this.dashboardService.getDashboardData().subscribe({
      next: ({ stats, recentTransactions, monthlyChart, categoryBreakdown }) => {
        setTimeout(() => {
          this.stats = stats;
          this.recentTransactions = recentTransactions;
          this.monthlyChart = monthlyChart;
          this.categoryBreakdown = categoryBreakdown;
          this.isLoading = false;
        }, 0);
      },
      error: (err) => {
        this.error = 'Failed to load dashboard data. Please try again.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  // ── Modal ──
  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.form.reset({
      date: new Date().toISOString().split('T')[0]
    });
    this.selectedType = 'expense';
  }

  setType(type: 'expense' | 'income'): void {
    this.selectedType = type;
  }

  submitTransaction(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { description, amount, category, date } = this.form.value;
    this.store.dispatch(addTransaction({
      transaction: {
        description,
        amount: Number(amount),
        category,
        date,
        type: this.selectedType,
        user_id: '',
        created_at: new Date().toISOString()
      }
    }));

    this.closeModal();
    this.load();
  }
  getChartMaxValue(): number {
    return Math.max(...this.monthlyChart.flatMap(m => [m.income, m.expenses]), 1);
  }

  getBarHeight(value: number): string {
    return `${(value / this.getChartMaxValue()) * 100}%`;
  }

  getDonutGradient(): string {
    if (!this.categoryBreakdown.length) return 'var(--border)';
    const total = this.categoryBreakdown.reduce((s, c) => s + c.amount, 0);
    let cumulative = 0;
    const stops = this.categoryBreakdown.map(c => {
      const start = (cumulative / total) * 100;
      cumulative += c.amount;
      const end = (cumulative / total) * 100;
      return `${c.color} ${start}% ${end}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }

  getSavingsRateLabel(): string {
    if (!this.stats) return '';
    return this.stats.savingsRate >= 30 ? 'Above 30% target ✓' : 'Below 30% target';
  }

  getCategoryColor(category: string): string {
    return this.categoryMeta[category]?.color ?? 'var(--muted)';
  }

  getCategoryBg(category: string): string {
    return this.categoryMeta[category]?.bg ?? 'var(--surface2)';
  }

  getCategoryEmoji(category: string): string {
    return this.categoryMeta[category]?.emoji ?? '📦';
  }

  trackById(_: number, tx: Transaction): string { return tx.id; }
  trackByMonth(_: number, m: { month: string }): string { return m.month; }
  trackByCategory(_: number, c: { category: string }): string { return c.category; }
}