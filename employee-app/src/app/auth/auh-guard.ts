import { map, take } from 'rxjs';

import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';

import { OidcSecurityService } from 'angular-auth-oidc-client';

export const authGuard: CanActivateFn = () => {
  const oidcService = inject(OidcSecurityService);

  return oidcService.isAuthenticated$.pipe(
    take(1),
    map(({ isAuthenticated }) => {
      if (isAuthenticated) {
        return true;
      }
      // Redirect to login
      oidcService.authorize();
      return false;
    }),
  );
};
