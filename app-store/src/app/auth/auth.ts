import { DOCUMENT, inject, Injectable, signal } from '@angular/core';

import { Router } from '@angular/router';

import { defer, finalize, map, ReplaySubject, switchMap, take, tap } from 'rxjs';

import { OidcSecurityService } from 'angular-auth-oidc-client';

import { AuthUtils } from './auth-utils';
import { LogoutChannelService } from './logout-channel.service';

const POST_LOGIN_REDIRECT_KEY = 'app-store-post-login-redirect';
const INVALID_REDIRECT_PATHS = ['/sso', '/sign-out', '/unauthorized', '/auth-error'];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly oidcService = inject(OidcSecurityService);
  private readonly logoutChannelService = inject(LogoutChannelService);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly authReadySubject = new ReplaySubject<true>(1);

  /** True after the single startup `checkAuth()` call has finished. */
  readonly authReady = signal(false);

  readonly authReady$ = this.authReadySubject.asObservable();

  isAuthenticated$ = this.oidcService.isAuthenticated$.pipe(
    map(({ isAuthenticated }) => isAuthenticated),
  );

  /** Guards and callback pages use this instead of the raw isAuthenticated$ to avoid the race. */
  readonly isAuthenticatedAfterCheck$ = this.authReady$.pipe(
    switchMap(() => this.isAuthenticated$),
  );

  userData$ = this.oidcService.userData$;

  accessToken$ = this.oidcService.getAccessToken();

  checkAuth(url?: string) {
    return this.oidcService.checkAuth(url).pipe(
      tap(() => this.markAuthReady()),
      finalize(() => this.markAuthReady()),
    );
  }

  markAuthReady(): void {
    if (this.authReady()) {
      return;
    }
    this.authReady.set(true);
    this.authReadySubject.next(true);
  }

  login() {
    this.oidcService.isAuthenticated$.pipe(take(1)).subscribe(({ isAuthenticated }) => {
      if (isAuthenticated) {
        void this.router.navigateByUrl(this.consumeRedirectUrl() ?? '/home');
        return;
      }
      this.oidcService.authorize();
    });
  }

  /**
   * User-initiated logout - broadcasts to other tabs and revokes tokens.
   * This will trigger SSO logout across all apps in the same realm.
   */
  logout() {
    return defer(() => {
      // Broadcast to other tabs BEFORE logging out
      this.logoutChannelService.broadcastLogout();
      return this.oidcService.logoffAndRevokeTokens();
    });
  }

  // For SSO - check if user is authenticated in another app
  checkAuthIncludingServer() {
    return this.oidcService.checkAuthIncludingServer();
  }

  getAccessToken() {
    return this.oidcService.getAccessToken();
  }

  hasOidcCallbackParams(url: string = globalThis.location.href): boolean {
    return AuthUtils.hasOidcCallbackParams(url);
  }

  saveRedirectUrl(url: string | null | undefined): void {
    if (!this.isValidRedirectUrl(url)) {
      return;
    }
    this.document.defaultView?.sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, url);
  }

  consumeRedirectUrl(): string | null {
    const storage = this.document.defaultView?.sessionStorage;
    const stored = storage?.getItem(POST_LOGIN_REDIRECT_KEY) ?? null;
    storage?.removeItem(POST_LOGIN_REDIRECT_KEY);
    return this.isValidRedirectUrl(stored) ? stored : null;
  }

  isValidRedirectUrl(url: string | null | undefined): url is string {
    if (!url) {
      return false;
    }
    const lowerUrl = url.toLowerCase();
    return !INVALID_REDIRECT_PATHS.some(
      (path) => lowerUrl === path || lowerUrl.startsWith(`${path}?`),
    );
  }
}
