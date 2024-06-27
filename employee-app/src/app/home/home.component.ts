import { EventTypes, OidcSecurityService, PublicEventsService } from 'angular-auth-oidc-client';

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'kp-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  user!: string;
  isAuthenticated!: boolean;

  constructor(
    public router: Router,
    public oidcSecurityService: OidcSecurityService,
    private eventService: PublicEventsService
  ) {}

  ngOnInit(): void {
    this.oidcSecurityService.checkAuthIncludingServer().subscribe(({ userData }) => (this.user = userData.name));
    this.eventService
      .registerForEvents()
      .pipe(filter(notification => notification.type === EventTypes.CheckSessionReceived))
      .subscribe(value => {
        console.log('Session changed event receieved ', value);
        if (value && value.value === 'changed') {
          this.oidcSecurityService.logoff().subscribe(() => this.router.navigateByUrl('/sign-out'));
        }
      });
  }

  logout(): void {
    this.oidcSecurityService.logoff().subscribe();
  }
}
