import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { catchError, throwError } from 'rxjs';

/**
 * Check if the request is to an OIDC/OAuth endpoint that should be skipped.
 * Keycloak URLs contain '/auth/' - these are handled by angular-auth-oidc-client.
 */
const isOidcRequest = (url: string): boolean => url.includes('/auth/');

/**
 * Global HTTP interceptor to handle 401 and 403 responses from backend APIs.
 *
 * NOTE: OIDC-related requests (containing '/auth/') are skipped
 * because angular-auth-oidc-client handles those errors via PublicEventsService.
 *
 * - 401 Unauthorized: Token expired or invalid, clears local session and redirects to unauthorized page
 * - 403 Forbidden: User lacks permission, redirects to unauthorized page with reason
 */
export const httpErrorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  // Skip OIDC-related requests - let the library handle those errors
  if (isOidcRequest(req.url)) {
    return next(req);
  }

  const router = inject(Router);
  const oidcService = inject(OidcSecurityService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Unauthorized - token expired or invalid
        console.warn('HTTP 401: Unauthorized - clearing session');
        oidcService.logoffLocal();
        router.navigate(['/unauthorized'], {
          queryParams: { reason: 'session-expired' },
          replaceUrl: true,
        });
      } else if (error.status === 403) {
        // Forbidden - user lacks permission
        console.warn('HTTP 403: Forbidden - access denied');
        router.navigate(['/unauthorized'], {
          queryParams: { reason: '403' },
          replaceUrl: true,
        });
      }

      return throwError(() => error);
    }),
  );
};
