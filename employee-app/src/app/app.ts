import { Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { Router, RouterOutlet } from '@angular/router';

import { Subscription } from 'rxjs';

import {
  AbstractSecurityStorage,
  EventTypes,
  OidcSecurityService,
  PublicEventsService,
  ValidationResult,
} from 'angular-auth-oidc-client';

import { AuthErrorService } from './auth/auth-error.service';
import { CheckSessionService } from './auth/check-session.service';
import { LogoutChannelService } from './auth/logout-channel.service';

@Component({
  selector: 'kp-root',
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('Employee Portal');
  private readonly oidcService = inject(OidcSecurityService);
  private readonly eventService = inject(PublicEventsService);
  private readonly checkSessionService = inject(CheckSessionService);
  private readonly logoutChannelService = inject(LogoutChannelService);
  private readonly router = inject(Router);
  private readonly authErrorService = inject(AuthErrorService);
  private readonly dialog = inject(MatDialog);
  private readonly storageService = inject(AbstractSecurityStorage);
  private eventSubscription?: Subscription;

  // Track validation result from auth events
  private lastValidationResult: ValidationResult | null = null;

  constructor() {
    // React to session changes from custom check session service
    effect(() => {
      if (this.checkSessionService.sessionChanged()) {
        this.handleSsoLogout('session-ended');
      }
    });

    // React to logout broadcast from another tab/app
    effect(() => {
      if (this.logoutChannelService.logoutReceived()) {
        this.handleSsoLogout('session-ended');
      }
    });
  }

  ngOnInit() {
    // Set up event listeners for SSO events
    this.setupAuthEventListeners();

    // Initialize logout channel (BroadcastChannel or localStorage based on config)
    this.logoutChannelService.init();

    // IMPORTANT: With hash-based routing (#/sso), callback params from Keycloak
    // are in the URL BEFORE the hash: https://host/?code=xxx&state=yyy#/sso
    // We must capture and process them here before Angular routing strips them away
    const currentUrl = globalThis.location.href;
    const hasCallbackParams = this.hasOidcCallbackParams(currentUrl);

    // Initialize OIDC - pass the full URL to process any callback params
    this.oidcService.checkAuth(currentUrl).subscribe({
      next: ({ isAuthenticated }) => {
        if (isAuthenticated) {
          // Start custom check session service after authentication
          this.startCheckSession();

          // If this was a callback (had code=), redirect to intended destination
          if (hasCallbackParams) {
            const storedRedirect = this.storageService.read('redirect');
            const redirectUrl = this.isValidRedirectUrl(storedRedirect) ? storedRedirect : '/home';
            this.router.navigateByUrl(redirectUrl);
          }
        } else if (hasCallbackParams) {
          // Had callback params but not authenticated - auth failed
          this.handleAuthFailure();
        }
        // If no callback params and not authenticated, let the auth guard handle it
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

          // Check if we have a captured validation result for better error handling
          if (hasCallbackParams && this.lastValidationResult) {
            this.handleValidationResult(this.lastValidationResult);
          } else if (hasCallbackParams) {
            // Callback failed but no specific validation result - check error message
            if (errorStr.includes('validation failed') || errorStr.includes('token(s) invalid')) {
              this.router.navigate(['/auth-error'], {
                queryParams: { reason: 'generic' },
                replaceUrl: true,
              });
            } else {
              this.authErrorService.handleAuthError(err, EventTypes.CheckingAuthFinishedWithError);
            }
          } else {
            this.authErrorService.handleAuthError(err, EventTypes.CheckingAuthFinishedWithError);
          }
        }
      },
    });
  }

  /**
   * Check if URL contains OIDC callback parameters
   * Uses same regex pattern as the OIDC library's getUrlParameter method
   * which handles params in query string (?), as additional params (&), or after hash (#)
   * This covers both: ?code=xxx&state=yyy#/sso and #/sso?code=xxx&state=yyy
   */
  private hasOidcCallbackParams(url: string): boolean {
    const callbackParams = ['code', 'state', 'token', 'id_token', 'error'];
    return callbackParams.some((param) => {
      const regex = new RegExp('[\\?&#]' + param + '=([^&#]*)');
      return regex.test(url);
    });
  }

  /**
   * Handle authentication failure after callback
   */
  private handleAuthFailure(): void {
    if (this.lastValidationResult) {
      this.handleValidationResult(this.lastValidationResult);
    } else {
      // Generic auth failure - redirect to error page
      this.router.navigate(['/auth-error'], {
        queryParams: { reason: 'generic' },
        replaceUrl: true,
      });
    }
  }

  /**
   * Handle specific validation results from the OIDC library
   */
  private handleValidationResult(result: ValidationResult): void {
    if (result === ValidationResult.MaxOffsetExpired) {
      // Time-skew error
      this.router.navigate(['/auth-error'], {
        queryParams: { reason: 'time-skew' },
        replaceUrl: true,
      });
    } else if (
      result === ValidationResult.SignatureFailed ||
      result === ValidationResult.IssDoesNotMatchIssuer ||
      result === ValidationResult.IncorrectAud ||
      result === ValidationResult.IncorrectAzp ||
      result === ValidationResult.IncorrectAtHash ||
      result === ValidationResult.StatesDoNotMatch ||
      result === ValidationResult.IncorrectNonce
    ) {
      this.router.navigate(['/auth-error'], {
        queryParams: { reason: 'generic' },
        replaceUrl: true,
      });
    }
  }

  /**
   * Validate redirect URL to prevent infinite loops
   */
  private isValidRedirectUrl(url: string | null | undefined): url is string {
    if (!url) {
      return false;
    }
    const invalidPaths = ['/sso', '/sign-out', '/unauthorized', '/auth-error'];
    const lowerUrl = url.toLowerCase();
    return !invalidPaths.some((path) => lowerUrl === path || lowerUrl.startsWith(`${path}?`));
  }

  ngOnDestroy() {
    this.eventSubscription?.unsubscribe();
    this.checkSessionService.stop();
    this.logoutChannelService.stop();
  }

  /**
   * Start custom check session service as workaround for library bug.
   * The library's built-in check session iframe has src="" bug.
   */
  private startCheckSession() {
    this.checkSessionService.start();
  }

  /**
   * Broadcast logout to other tabs/apps.
   * Call this when user explicitly logs out.
   */
  broadcastLogout() {
    this.logoutChannelService.broadcastLogout();
  }

  /**
   * Central auth event handling for SSO across multiple apps.
   * When logout happens from ANY app in the same Keycloak realm,
   * this app will detect it and clean up locally.
   */
  private setupAuthEventListeners() {
    this.eventSubscription = this.eventService.registerForEvents().subscribe((event) => {
      switch (event.type) {
        case EventTypes.NewAuthenticationResult:
          // Capture validation result for error handling
          if (event.value) {
            const authResult = event.value as { validationResult?: ValidationResult };
            if (authResult.validationResult) {
              this.lastValidationResult = authResult.validationResult;
            }
          }
          break;

        case EventTypes.SilentRenewFailed:
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
    // Close all open dialogs before navigating
    this.dialog.closeAll();
    this.oidcService.logoffLocal();
    this.router.navigate(['/unauthorized'], {
      queryParams: { reason },
      replaceUrl: true,
    });
  }
}
