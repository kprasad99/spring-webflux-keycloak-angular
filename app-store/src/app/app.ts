import { Component, OnDestroy, OnInit, effect, inject, signal } from '@angular/core';
import { EventTypes, OidcSecurityService, PublicEventsService } from 'angular-auth-oidc-client';
import { Router, RouterOutlet } from '@angular/router';

import { Subscription } from 'rxjs';

import { AuthErrorService } from './auth/auth-error.service';
import { CheckSessionService } from './auth/check-session.service';

const LOGOUT_CHANNEL_NAME = 'sso-logout';

@Component({
  selector: 'kp-root',
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('App Store');
  private readonly oidcService = inject(OidcSecurityService);
  private readonly eventService = inject(PublicEventsService);
  private readonly checkSessionService = inject(CheckSessionService);
  private readonly router = inject(Router);
  private readonly authErrorService = inject(AuthErrorService);
  private eventSubscription?: Subscription;
  private logoutChannel?: BroadcastChannel;

  constructor() {
    // React to session changes from custom check session service
    effect(() => {
      if (this.checkSessionService.sessionChanged()) {
        this.handleSsoLogout('session-ended');
      }
    });
  }

  ngOnInit() {
    // Set up event listeners for SSO events
    this.setupAuthEventListeners();

    // Set up BroadcastChannel for same-browser cross-tab logout (faster than check session)
    this.setupLogoutChannel();

    // Initialize OIDC - required for the library to work properly
    // This checks if there's an existing valid session
    // "No token" errors are expected when user is not logged in - they're not actual errors
    this.oidcService.checkAuth().subscribe({
      next: ({ isAuthenticated }) => {
        // Start custom check session service after authentication
        if (isAuthenticated) {
          this.startCheckSession();
        }
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
    this.checkSessionService.stop();
    this.logoutChannel?.close();
  }

  /**
   * Start custom check session service as workaround for library bug.
   * The library's built-in check session iframe has src="" bug.
   */
  private startCheckSession() {
    this.checkSessionService.start();
  }

  /**
   * Set up BroadcastChannel for instant cross-tab logout detection.
   * This works for tabs of the same origin (same app) and is faster than check session iframe.
   */
  private setupLogoutChannel() {
    if (typeof BroadcastChannel === 'undefined') {
      return;
    }

    this.logoutChannel = new BroadcastChannel(LOGOUT_CHANNEL_NAME);
    this.logoutChannel.onmessage = (event) => {
      if (event.data === 'logout') {
        this.handleSsoLogout('session-ended');
      }
    };
  }

  /**
   * Broadcast logout to other tabs of the same app.
   * Call this when user explicitly logs out.
   */
  broadcastLogout() {
    this.logoutChannel?.postMessage('logout');
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
          if (event.value === 'changed') {
            this.handleSsoLogout('session-ended');
          }
          break;

        case EventTypes.TokenExpired:
          // Token expired - try to refresh
          // console.log('Access token expired - attempting refresh');
          break;

        case EventTypes.IdTokenExpired:
          // ID token expired - usually harmless if access token is still valid
          //console.log('ID token expired');
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
