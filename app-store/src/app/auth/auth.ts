import { Injectable, inject } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly oidcService = inject(OidcSecurityService);

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
