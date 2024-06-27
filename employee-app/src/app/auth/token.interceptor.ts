import { catchError, defaultIfEmpty, map, switchMap } from 'rxjs';

import { HttpInterceptorFn } from '@angular/common/http';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { inject } from '@angular/core';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  let matches = false;
  const paths = ['/api'];
  const oidc = inject(OidcSecurityService);
  for (const str of paths) {
    if (req.url.startsWith(str)) {
      matches = true;
      break;
    }
  }
  if (matches) {
    return oidc.getAccessToken().pipe(
      defaultIfEmpty(''),
      catchError(() => ''),
      map((v: string) => {
        if (v) {
          const tokenValue = `Bearer ${v}`;
          return req.clone({
            setHeaders: {
              Authorization: tokenValue
            }
          });
        }
        return req;
      }),
      switchMap(request => next(request))
    );
  }
  return next(req);
};
