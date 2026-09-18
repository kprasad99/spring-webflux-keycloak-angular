import { inject } from '@angular/core';

import { CanActivateFn } from '@angular/router';

import { map, take } from 'rxjs';

import { OidcSecurityService } from 'angular-auth-oidc-client';

import { AuthService } from './auth';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const oidcService = inject(OidcSecurityService);

  return authService.isAuthenticatedAfterCheck$.pipe(
    take(1),
    map((isAuthenticated) => {
      if (isAuthenticated) {
        return true;
      }

      // Let the in-flight OIDC code exchange finish. A competing authorize()
      // overwrites PKCE/state and is the main post-login unauthorized race.
      if (authService.hasOidcCallbackParams()) {
        return false;
      }

      authService.saveRedirectUrl(state.url);
      oidcService.authorize();
      return false;
    }),
  );
};
