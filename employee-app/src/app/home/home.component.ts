import { Component, OnDestroy, OnInit } from '@angular/core';
import { EventTypes, OidcSecurityService, PublicEventsService } from 'angular-auth-oidc-client';

import { Router } from '@angular/router';

import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'kp-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  user!: string;
  isAuthenticated!: boolean;
  eventSubscription!: Subscription;

  constructor(
    public router: Router,
    public oidcSecurityService: OidcSecurityService,
    private eventService: PublicEventsService
  ) {}

  ngOnInit(): void {
    this.oidcSecurityService.checkAuthIncludingServer().subscribe(({ isAuthenticated, userData }) => {
      if (isAuthenticated) {
        this.user = userData.name;
      } else {
        this.router.navigateByUrl('/sso');
      }
    });
    this.eventSubscription = this.eventService
      .registerForEvents()
      .pipe(filter(notification => notification.type === EventTypes.CheckSessionReceived))
      .subscribe(value => {
        console.log('Session changed event receieved ', value);
        if (value && value.value === 'changed') {
          if (this.eventSubscription && !this.eventSubscription.closed) {
            this.eventSubscription.unsubscribe();
          }
          this.oidcSecurityService.logoffAndRevokeTokens().subscribe(() => this.router.navigateByUrl('/sign-out'));
        }
      });
  }

  ngOnDestroy(): void {
    if (this.eventSubscription && !this.eventSubscription.closed) {
      this.eventSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.oidcSecurityService.logoffAndRevokeTokens().subscribe();
  }
}
