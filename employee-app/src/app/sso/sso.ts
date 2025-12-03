import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

import { delay, take } from 'rxjs';

import { AbstractSecurityStorage, OidcSecurityService } from 'angular-auth-oidc-client';

/**
 * SSO Component - Landing page after OIDC callback
 *
 * Note: The main OIDC callback processing (with code/state params) is now handled
 * in app.ts because with hash-based routing (#/sso), the callback params appear
 * BEFORE the hash in the URL (e.g., host/?code=xxx&state=yyy#/sso) and are lost
 * by the time this component loads.
 *
 * This component now serves as:
 * 1. A visual loading indicator while authentication completes
 * 2. Redirect to intended destination after successful auth
 * 3. An error display with retry capability
 */
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
  private readonly destroyRef = inject(DestroyRef);

  retry(): void {
    this.errMessage.set(null);
    this.oidcSecurityService.authorize();
  }

  ngOnInit(): void {
    // The main OIDC callback processing happens in app.ts where we have access
    // to the full URL including callback params before they're stripped by hash routing.
    //
    // This component only handles:
    // 1. Redirecting to intended destination if already authenticated
    // 2. Showing loading spinner while auth is in progress
    //
    // IMPORTANT: Do NOT call authorize() here - app.ts handles auth failures
    // and redirects to /auth-error. Calling authorize() here would cause a loop.

    this.oidcSecurityService.isAuthenticated$
      .pipe(
        delay(1000), // Small delay for UX
        take(1), // Only take one value to avoid repeated subscriptions
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((authResult) => {
        if (authResult.isAuthenticated) {
          // Authenticated - redirect to last launched page
          const storedRedirect = this.storageService.read('redirect');
          const redirectUrl = this.isValidRedirectUrl(storedRedirect) ? storedRedirect : '/home';
          this.router.navigateByUrl(redirectUrl);
        } else {
          // Not authenticated - user likely navigated directly to /sso
          // Redirect to unauthorized page
          this.router.navigate(['/unauthorized'], {
            queryParams: { reason: 'not-authenticated' },
            replaceUrl: true,
          });
        }
      });
  }

  /**
   * Validate redirect URL to prevent infinite loops
   * Returns false for SSO-related paths or invalid URLs
   */
  private isValidRedirectUrl(url: string | null | undefined): url is string {
    if (!url) {
      return false;
    }

    // Paths that would cause infinite loops or are auth-related
    const invalidPaths = ['/sso', '/sign-out', '/unauthorized', '/auth-error'];

    const lowerUrl = url.toLowerCase();
    return !invalidPaths.some((path) => lowerUrl === path || lowerUrl.startsWith(`${path}?`));
  }
}
