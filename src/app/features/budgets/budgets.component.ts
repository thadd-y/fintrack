import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { switchMap, filter } from 'rxjs';
import { AppState } from '../../store/app.state';
import { loadBudgets, addBudget, deleteBudget } from './store/budget.action';
import { selectAllBudgets, selectBudgetLoading } from './store/budget.selector';
import { BudgetService, BudgetSummary } from './services/budget.service';
import { BudgetWithSpend, BudgetPeriod } from './models/budget.model';
import { AuthService } from '../../core/auth/auth.service';

interface BudgetField {
  key: string;
  label: string;
  type: string;
  placeholder: string;
}

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './budgets.component.html',
  styleUrl: './budgets.component.scss'
})
export class BudgetsComponent implements OnInit {
  private store = inject(Store<AppState>);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private budgetService = inject(BudgetService);

  isLoading = true;
  error: string | null = null;
  summary: BudgetSummary | null = null;

  showModal = false;
  readonly today = new Date();

  readonly periods: BudgetPeriod[] = ['monthly', 'weekly', 'yearly'];
  selectedPeriod: BudgetPeriod = 'monthly';

  readonly fields: BudgetField[] = [
    { key: 'name', label: 'Budget name', type: 'text', placeholder: 'e.g. Groceries' },
    { key: 'category', label: 'Category', type: 'text', placeholder: 'e.g. Food' },
    { key: 'limit', label: 'Limit (R)', type: 'number', placeholder: '0.00' },
  ];

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    category: ['', Validators.required],
    limit: [null, [Validators.required, Validators.min(1)]],
  });

  readonly statusMeta = {
    safe: { color: 'var(--green)', trackColor: 'var(--green)' },
    warning: { color: 'var(--amber)', trackColor: 'var(--amber)' },
    over: { color: 'var(--red)', trackColor: 'var(--red)' },
  };

  ngOnInit(): void {
    this.store.dispatch(loadBudgets());
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.error = null;

    this.store.select(selectAllBudgets).pipe(
      filter(budgets => budgets !== undefined),
      switchMap(budgets => this.budgetService.getBudgetSummary(budgets))
    ).subscribe({
      next: summary => {
        this.summary = summary;
        this.isLoading = false;
      },
      error: err => {
        this.error = 'Failed to load budgets. Please try again.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  openModal(): void { this.showModal = true; }
  closeModal(): void {
    this.showModal = false;
    this.form.reset();
    this.selectedPeriod = 'monthly';
  }

  setPeriod(period: BudgetPeriod): void {
    this.selectedPeriod = period;
  }

  submitBudget(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, category, limit } = this.form.value;

    this.store.dispatch(addBudget({
      budget: {
        name,
        category,
        limit: Number(limit),
        period: this.selectedPeriod,
        user_id: this.auth.currentUser?.id ?? ''
      }
    }));

    this.closeModal();
  }

  removeBudget(id: string): void {
    this.store.dispatch(deleteBudget({ id }));
  }

  getProgressWidth(percentage: number): string {
    return `${Math.min(percentage, 100)}%`;
  }

  getStatusColor(status: BudgetWithSpend['status']): string {
    return this.statusMeta[status].color;
  }

  trackById(_: number, b: { id: string }): string { return b.id; }
}