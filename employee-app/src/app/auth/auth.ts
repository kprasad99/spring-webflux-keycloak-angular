import { Injectable, inject } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { map } from 'rxjs';

const LOGOUT_CHANNEL_NAME = 'sso-logout';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly oidcService = inject(OidcSecurityService);
  private readonly logoutChannel?: BroadcastChannel;

  constructor() {
    if (typeof BroadcastChannel !== 'undefined') {
      this.logoutChannel = new BroadcastChannel(LOGOUT_CHANNEL_NAME);
    }
  }

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

  logout() {
    // Broadcast to other tabs before logging out
    this.logoutChannel?.postMessage('logout');
    this.oidcService.logoff().subscribe();
  }

  // For SSO - check if user is authenticated in another app
  checkAuthIncludingServer() {
    return this.oidcService.checkAuthIncludingServer();
  }

  getAccessToken() {
    return this.oidcService.getAccessToken();
  }
}
