import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

interface LoginField {
  key: string;
  label: string;
  type: string;
  placeholder: string;
  validators: any[];
  errors: Record<string, string>;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  isLoading = false;
  isSignUp = false;
  errorMessage = '';
  successMessage = '';

  fields: LoginField[] = [
    {
      key: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'you@example.com',
      validators: [Validators.required, Validators.email],
      errors: {
        required: 'Email is required',
        email: 'Enter a valid email address'
      }
    },
    {
      key: 'password',
      label: 'Password',
      type: 'password',
      placeholder: '••••••••',
      validators: [Validators.required, Validators.minLength(6)],
      errors: {
        required: 'Password is required',
        minlength: 'Password must be at least 6 characters'
      }
    }
  ];

  form: FormGroup = this.fb.group(
    Object.fromEntries(
      this.fields.map(f => [f.key, ['', f.validators]])
    )
  );

  getError(key: string): string {
    const control = this.form.get(key);
    const field = this.fields.find(f => f.key === key);
    if (!control || !field || !control.invalid || !control.touched) return '';
    const errorKey = Object.keys(field.errors).find(e => control.hasError(e));
    return errorKey ? field.errors[errorKey] : '';
  }

  toggleMode(): void {
    this.isSignUp = !this.isSignUp;
    this.errorMessage = '';
    this.successMessage = '';
    this.form.reset();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { email, password } = this.form.value;

    if (this.isSignUp) {
      this.auth.signUp(email, password).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Account created! Check your email to confirm before signing in.';
          this.form.reset();
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.message ?? 'Sign up failed. Please try again.';
        }
      });
    } else {
      this.auth.login(email, password).subscribe({
        next: () => {
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.message ?? 'Login failed. Please try again.';
        }
      });
    }
  }
}