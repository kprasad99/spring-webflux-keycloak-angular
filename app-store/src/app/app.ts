import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { EventTypes, OidcSecurityService, PublicEventsService } from 'angular-auth-oidc-client';
import { Router, RouterOutlet } from '@angular/router';

import { Subscription } from 'rxjs';

import { AuthErrorService } from './auth/auth-error.service';

@Component({
  selector: 'kp-root',
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('App Store');
  private readonly oidcService = inject(OidcSecurityService);
  private readonly eventService = inject(PublicEventsService);
  private readonly router = inject(Router);
  private readonly authErrorService = inject(AuthErrorService);
  private eventSubscription?: Subscription;

  ngOnInit() {
    // Set up event listeners for SSO events
    this.setupAuthEventListeners();

    // Initialize OIDC - required for the library to work properly
    // This checks if there's an existing valid session
    // "No token" errors are expected when user is not logged in - they're not actual errors
    this.oidcService.checkAuth().subscribe({
      next: ({ isAuthenticated }) => {
        console.log('Auth check complete, authenticated:', isAuthenticated);
      },
      error: (err) => {
        // Only handle real errors (network, time-skew), not "no token" situations
        const errorStr = String(err).toLowerCase();
        const isNoTokenError =
          errorStr.includes('no refresh token') ||
          errorStr.includes('no token') ||
          errorStr.includes('please login');

        if (!isNoTokenError) {
          console.error('Auth initialization error:', err);
          this.authErrorService.handleAuthError(err, EventTypes.CheckingAuthFinishedWithError);
        }
      },
    });
  }

  ngOnDestroy() {
    this.eventSubscription?.unsubscribe();
  }

  /**
   * Central auth event handling for SSO across multiple apps.
   * When logout happens from ANY app in the same Keycloak realm,
   * this app will detect it and clean up locally.
   */
  private setupAuthEventListeners() {
    this.eventSubscription = this.eventService.registerForEvents().subscribe((event) => {
      switch (event.type) {
        case EventTypes.SilentRenewFailed:
          // Token refresh failed - session expired at Keycloak
          console.warn('Token refresh failed - session may have ended');
          this.authErrorService.handleAuthError(event.value, event.type);
          break;

        case EventTypes.CheckSessionReceived:
          // Session check iframe detected a change at Keycloak
          if (event.value === 'changed') {
            console.log('SSO session changed - user logged out from another app');
            this.handleSsoLogout('session-ended');
          }
          break;

        case EventTypes.TokenExpired:
          console.log('Access token expired - attempting refresh');
          break;

        case EventTypes.IdTokenExpired:
          console.log('ID token expired');
          break;
      }
    });
  }

  /**
   * Handle SSO logout when session ends from another app or expires.
   */
  private handleSsoLogout(reason: 'session-expired' | 'session-ended') {
    this.oidcService.logoffLocal();
    this.router.navigate(['/unauthorized'], {
      queryParams: { reason },
      replaceUrl: true,
    });
  }
}
