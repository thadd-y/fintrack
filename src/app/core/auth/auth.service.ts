import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, from, Observable, filter, take, map } from 'rxjs';
import { tap } from 'rxjs/operators';
import { supabase } from '../supabase/supabase.client';
import { AuthUser } from './auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);

  private currentUser$ = new BehaviorSubject<AuthUser | null | undefined>(undefined);

  user$ = this.currentUser$.asObservable();

  sessionReady$ = this.currentUser$.pipe(
    filter(user => user !== undefined),
    take(1)
  );

  constructor() {
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (session) {
        this.currentUser$.next({
          id: session.user.id,
          email: session.user.email ?? '',
          token: session.access_token
        });
      } else {
        this.currentUser$.next(null);
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        this.currentUser$.next({
          id: session.user.id,
          email: session.user.email ?? '',
          token: session.access_token
        });
      } else {
        this.currentUser$.next(null);
      }
    });
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser$.value;
  }
  
  get currentUser(): AuthUser | null | undefined {
    return this.currentUser$.value;
  }

  login(email: string, password: string): Observable<AuthUser> {
    return from(
      supabase.auth.signInWithPassword({ email, password })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        if (!data.session) throw new Error('No session returned');
        return {
          id: data.user!.id,
          email: data.user!.email ?? '',
          token: data.session.access_token
        };
      }),
      tap(user => {
        this.currentUser$.next(user);
        this.router.navigate(['/dashboard']);
      })
    );
  }

  signUp(email: string, password: string): Observable<void> {
    return from(supabase.auth.signUp({ email, password })).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  logout(): void {
    from(supabase.auth.signOut()).subscribe(() => {
      this.currentUser$.next(null);
      this.router.navigate(['/login']);
    });
  }

  getToken(): string | null {
    return this.currentUser$.value?.token ?? null;
  }
}

