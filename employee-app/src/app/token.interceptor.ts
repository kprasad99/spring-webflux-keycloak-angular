import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';

import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private oidc: OidcSecurityService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let token!: string;
    try {
      token = this.oidc.getAccessToken();
    } catch (err) {}
    if (token && request.url.trim().startsWith('/api')) {
      const tokenValue = `Bearer ${token}`;
      request = request.clone({
        setHeaders: {
          Authorization: tokenValue
        }
      });
    }
    return next.handle(request);
  }
}
