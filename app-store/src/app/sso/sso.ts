import { AbstractSecurityStorage, EventTypes, OidcSecurityService } from 'angular-auth-oidc-client';
import { Component, OnInit, inject, signal } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

import { delay } from 'rxjs';

import { AuthErrorService } from '../auth/auth-error.service';

@Component({
  selector: 'kp-sso',
  imports: [MatProgressSpinnerModule, MatButtonModule],
  templateUrl: './sso.html',
  styleUrl: './sso.scss',
})
export class Sso implements OnInit {
  protected readonly errMessage = signal<string | null>(null);
  private readonly router = inject(Router);
  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly storageService = inject(AbstractSecurityStorage);
  private readonly authErrorService = inject(AuthErrorService);

  retry(): void {
    this.errMessage.set(null);
    this.oidcSecurityService.authorize();
  }

  ngOnInit(): void {
    // SSO page is the OIDC callback URL - process the auth response
    // Pass the current URL to ensure callback params are processed
    const currentUrl = globalThis.location.href;

    this.oidcSecurityService
      .checkAuth(currentUrl)
      // delay is just for UX experience, nothing do with functionality
      .pipe(delay(1000))
      .subscribe({
        next: ({ isAuthenticated }) => {
          if (isAuthenticated) {
            // Successfully authenticated - redirect to intended destination
            const redirectUrl = this.storageService.read('redirect') ?? '/home';
            this.router.navigateByUrl(redirectUrl);
          } else {
            // Check if we have callback params (code) in URL
            const hasCallbackParams = currentUrl.includes('code=') || currentUrl.includes('error=');

            if (hasCallbackParams) {
              // Had callback params but still not authenticated - auth failed
              this.errMessage.set('Authentication failed. Please try again.');
            } else {
              // No callback params - user landed here directly, start login
              this.oidcSecurityService.authorize();
            }
          }
        },
        error: (e) => {
          this.handleError(e);
        },
      });
  }

  private handleError(error: unknown): void {
    const errorStr = this.extractErrorMessage(error).toLowerCase();

    // "No token" errors on SSO page mean we should start login flow
    if (this.isNotAuthenticatedError(errorStr)) {
      // Check if URL has callback params
      const hasCallbackParams = globalThis.location.href.includes('code=');
      if (!hasCallbackParams) {
        // No callback - start login
        this.oidcSecurityService.authorize();
        return;
      }
      // Had callback but failed - show error
      this.errMessage.set('Authentication failed. Please try again.');
      return;
    }

    // Use AuthErrorService to categorize and redirect to error pages
    const handled = this.authErrorService.handleAuthError(
      error,
      EventTypes.CheckingAuthFinishedWithError,
    );

    // If not handled by service, show message locally with retry option
    if (!handled) {
      this.errMessage.set(this.extractErrorMessage(error));
    }
  }

  private isNotAuthenticatedError(errorStr: string): boolean {
    const notAuthIndicators = [
      'no refresh token',
      'no token',
      'not authenticated',
      'please login',
      'login required',
      'no id_token',
      'no access_token',
    ];
    return notAuthIndicators.some((indicator) => errorStr.includes(indicator));
  }

  private extractErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error && typeof error === 'object') {
      const e = error as Record<string, unknown>;

      if ('errorMessage' in e && typeof e['errorMessage'] === 'string') {
        return e['errorMessage'];
      }

      if ('error' in e && e['error'] instanceof Error) {
        return e['error'].message;
      }
    }

    if (error instanceof Error) {
      if (error.message.includes('[object Object]')) {
        return 'Authentication server not available';
      }
      return error.message;
    }

    return 'An unexpected authentication error occurred';
  }
}
