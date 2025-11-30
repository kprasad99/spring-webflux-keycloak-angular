import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';

import { switchMap, take } from 'rxjs';

import { OidcSecurityService } from 'angular-auth-oidc-client';

/**
 * List of URL patterns that require authentication tokens.
 * Only requests matching these patterns will have the Bearer token added.
 */
const PROTECTED_API_PATHS = ['/api'];

/**
 * Check if the request URL matches any of the protected API paths.
 */
const isProtectedApiRequest = (url: string): boolean =>
  PROTECTED_API_PATHS.some((path) => url.includes(path));

/**
 * Token interceptor that adds the Bearer token to outgoing HTTP requests.
 *
 * Only requests matching the PROTECTED_API_PATHS will have the token added.
 * All other requests pass through without modification.
 */
export const tokenInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  // Only add token to protected API requests
  if (!isProtectedApiRequest(req.url)) {
    return next(req);
  }

  const oidcService = inject(OidcSecurityService);

  return oidcService.getAccessToken().pipe(
    take(1),
    switchMap((token) => {
      if (token) {
        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
        return next(authReq);
      }
      return next(req);
    }),
  );
};
