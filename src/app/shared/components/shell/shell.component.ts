import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent {
  private auth = inject(AuthService);

  user$ = this.auth.user$;
  menuOpen = false;

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: '◈', route: '/dashboard' },
    { label: 'Transactions', icon: '⇄', route: '/transactions' },
    { label: 'Budgets', icon: '◎', route: '/budgets' },
  ];

  logout(): void {
    this.auth.logout();
  }
}