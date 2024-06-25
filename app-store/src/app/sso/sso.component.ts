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
    this.oidcSecurityService.checkAuthIncludingServer().subscribe(({ isAuthenticated }) => {
      if (isAuthenticated) {
        this.router.navigateByUrl(this.storageService.read('redirect') ?? '/home');
      } else {
        this.oidcSecurityService.authorize();
      }
    });
  }
}
