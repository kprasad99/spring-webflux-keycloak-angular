import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';

import { CommonModule } from '@angular/common';

import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';

import { OidcSecurityService } from 'angular-auth-oidc-client';

import { AuthService } from '../auth/auth';

@Component({
  selector: 'kp-home',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatRippleModule,
    MatDividerModule,
    RouterOutlet,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block h-screen',
  },
})
export class Home implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly authService = inject(AuthService);

  protected readonly user = signal('');

  ngOnInit(): void {
    // Get user data from the already authenticated session
    this.oidcSecurityService.userData$.subscribe(({ userData }) => {
      if (userData) {
        this.user.set(userData.name || userData.preferred_username || '');
      }
    });
  }

  /**
   * User-initiated logout - revokes tokens and redirects to Keycloak logout
   * This will trigger SSO logout across all apps in the same realm
   */
  logout(): void {
    this.authService.logout().subscribe();
  }
}
