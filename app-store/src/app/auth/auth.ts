import { inject, Injectable } from '@angular/core';

import { defer, map } from 'rxjs';

import { OidcSecurityService } from 'angular-auth-oidc-client';

import { LogoutChannelService } from './logout-channel.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly oidcService = inject(OidcSecurityService);
  private readonly logoutChannelService = inject(LogoutChannelService);

  isAuthenticated$ = this.oidcService.isAuthenticated$.pipe(
    map(({ isAuthenticated }) => isAuthenticated),
  );

  userData$ = this.oidcService.userData$;

  accessToken$ = this.oidcService.getAccessToken();

  checkAuth() {
    return this.oidcService.checkAuth();
  }

  login() {
    this.oidcService.authorize();
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
}
