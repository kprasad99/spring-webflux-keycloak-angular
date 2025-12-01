import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

import { OidcSecurityService } from 'angular-auth-oidc-client';

import { AuthService } from '../auth/auth';

interface AppItem {
  title: string;
  url: string;
}

@Component({
  selector: 'kp-home',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatDividerModule,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly authService = inject(AuthService);

  protected readonly user = signal('');
  protected readonly apps = signal<AppItem[]>([]);

  ngOnInit(): void {
    // Get user data from the already authenticated session
    this.oidcSecurityService.userData$.subscribe(({ userData }) => {
      if (userData) {
        this.user.set(userData.name || userData.preferred_username || '');
      }
    });

    // Load apps
    this.http.get<AppItem[]>('./apps.json').subscribe((apps) => {
      this.apps.set(apps);
    });
  }

  /**
   * User-initiated logout - revokes tokens and redirects to Keycloak logout
   * This will trigger SSO logout across all apps in the same realm
   */
  logout(): void {
    this.authService.logout();
  }
}
