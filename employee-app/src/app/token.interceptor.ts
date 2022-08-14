import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';

import { Injectable } from '@angular/core';

import { Observable, catchError, defaultIfEmpty, map, switchMap } from 'rxjs';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  paths = ['/api'];

  constructor(private oidc: OidcSecurityService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let matches = false;

    for (const str of this.paths) {
      if (request.url.startsWith(str)) {
        matches = true;
        break;
      }
    }
    if (matches) {
      return this.oidc.getAccessToken().pipe(
        defaultIfEmpty(''),
        catchError(() => ''),
        map((v: string) => {
          if (v) {
            const tokenValue = `Bearer ${v}`;
            return request.clone({
              setHeaders: {
                Authorization: tokenValue
              }
            });
          }
          return request;
        }),
        switchMap(req => next.handle(req))
      );
    }
    return next.handle(request);
  }
}
