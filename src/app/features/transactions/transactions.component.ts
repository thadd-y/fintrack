import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
import * as TransactionActions from './store/transaction.actions';
import {
  selectAllTransactions,
  selectTransactionsLoading,
  selectBalance
} from './store/transaction.selectors';
import { Transaction } from './transaction.model';

type FilterType = 'all' | 'income' | 'expense';
type SortField = 'date' | 'amount';

interface TransactionField {
  key: string;
  label: string;
  type: string;
  placeholder: string;
}

interface CategoryOption {
  value: string;
  label: string;
  emoji: string;
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent implements OnInit {
  private store = inject(Store<AppState>);
  private fb = inject(FormBuilder);

  transactions$ = this.store.select(selectAllTransactions);
  loading$ = this.store.select(selectTransactionsLoading);
  balance$ = this.store.select(selectBalance);

  filterType: FilterType = 'all';
  sortField: SortField = 'date';
  searchQuery = '';

  readonly filterOptions: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Income', value: 'income' },
    { label: 'Expenses', value: 'expense' },
  ];

  showModal = false;
  selectedType: 'expense' | 'income' = 'expense';

  readonly categories: CategoryOption[] = [
    { value: 'Food', label: 'Food', emoji: '🛒' },
    { value: 'Transport', label: 'Transport', emoji: '🚗' },
    { value: 'Entertainment', label: 'Entertainment', emoji: '🎬' },
    { value: 'Housing', label: 'Housing', emoji: '🏠' },
    { value: 'Income', label: 'Income', emoji: '💼' },
    { value: 'Other', label: 'Other', emoji: '📦' },
  ];

  readonly fields: TransactionField[] = [
    { key: 'description', label: 'Description', type: 'text', placeholder: 'e.g. Grocery run' },
    { key: 'amount', label: 'Amount (R)', type: 'number', placeholder: '0.00' },
    { key: 'date', label: 'Date', type: 'date', placeholder: '' },
  ];

  form: FormGroup = this.fb.group({
    description: ['', [Validators.required, Validators.minLength(3)]],
    amount: [null, [Validators.required, Validators.min(0.01)]],
    category: ['Food', Validators.required],
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
    this.store.dispatch(TransactionActions.loadTransactions());
  }

  getFiltered(transactions: Transaction[]): Transaction[] {
    return transactions
      .filter(t => {
        const matchesType = this.filterType === 'all' || t.type === this.filterType;
        const matchesSearch = !this.searchQuery ||
          t.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(this.searchQuery.toLowerCase());
        return matchesType && matchesSearch;
      })
      .sort((a, b) => {
        if (this.sortField === 'date') return b.date.localeCompare(a.date);
        if (this.sortField === 'amount') return b.amount - a.amount;
        return 0;
      });
  }

  setFilter(type: FilterType): void { this.filterType = type; }
  setSort(field: SortField): void { this.sortField = field; }
  onSearch(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
  }

  // ── Modal ──
  openModal(): void { this.showModal = true; }
  closeModal(): void {
    this.showModal = false;
    this.form.reset({
      category: 'Food',
      date: new Date().toISOString().split('T')[0]
    });
    this.selectedType = 'expense';
  }

  setType(type: 'expense' | 'income'): void { this.selectedType = type; }

  submitTransaction(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { description, amount, category, date } = this.form.value;

    this.store.dispatch(TransactionActions.addTransaction({
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
  }

  deleteTransaction(id: string): void {
    this.store.dispatch(TransactionActions.deleteTransaction({ id }));
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
}