import { AbstractSecurityStorage, OidcSecurityService } from 'angular-auth-oidc-client';

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'kp-sso',
  templateUrl: './sso.component.html',
  styleUrl: './sso.component.scss'
})
export class SsoComponent implements OnInit {
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
          const retriesStr = sessionStorage.getItem('oidc_retries');
          let retries = retriesStr ? +retriesStr : 0;
          if (retries > 2) {
            sessionStorage.removeItem('oidc_retries');
            this.router.navigate(['/unauthorized'], {
              queryParams: {
                message: errorMessage ?? 'unable to login, unknown error'
              }
            });
          } else {
            sessionStorage.setItem('oidc_retries', '' + ++retries);
            this.oidcSecurityService.authorize();
          }
        }
      },
      error: e => {
        let msg = '';
        if (e?.errorMessage) {
          msg = e.errorMessage;
        } else if (e?.error instanceof Error) {
          msg = e.error.message;
        } else if (e instanceof Error) {
          if (e.message.startsWith('Error: [object Object]')) {
            msg = 'OIDC server not available';
          } else {
            msg = e.message;
          }
        } else {
          msg = e;
        }
        sessionStorage.removeItem('oidc_retries');
        this.router.navigate(['/unauthorized'], {
          queryParams: {
            message: msg
          }
        });
      }
    });
  }
}
