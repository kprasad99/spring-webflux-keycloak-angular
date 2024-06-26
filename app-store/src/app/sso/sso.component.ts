import { AbstractSecurityStorage, OidcSecurityService } from 'angular-auth-oidc-client';

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'kp-sso',
  templateUrl: './sso.component.html',
  styleUrl: './sso.component.scss'
})
export class SsoComponent implements OnInit {
  errMessage = '';

  constructor(
    public router: Router,
    public oidcSecurityService: OidcSecurityService,
    private storageService: AbstractSecurityStorage
  ) {}

  ngOnInit(): void {
    this.oidcSecurityService.checkAuthIncludingServer().subscribe({
      next: ({ isAuthenticated, errorMessage }) => {
        if (isAuthenticated) {
          sessionStorage.removeItem('oidc_retries');
          this.router.navigateByUrl(this.storageService.read('redirect') ?? '/home');
        } else {
          const retriesStr = sessionStorage.getItem('oidc_retires');
          let retries = retriesStr ? +retriesStr : 0;
          if (retries > 2 && errorMessage) {
            this.errMessage = errorMessage;
          } else {
            retries += 1;
            sessionStorage.setItem('oidc_retires', '' + retries);
            this.oidcSecurityService.authorize();
          }
        }
      },
      error: e => {
        if (e?.errorMessage) {
          this.errMessage = e.errorMessage;
        } else if (e?.error instanceof Error) {
          this.errMessage = e.error.message;
        } else if (e instanceof Error) {
          if (e.message.startsWith('Error: [object Object]')) {
            this.errMessage = 'OIDC server not available';
          } else {
            this.errMessage = e.message;
          }
        } else {
          this.errMessage = e;
        }
      }
    });
  }
}
