import { Component, OnInit } from '@angular/core';
import { EventTypes, OidcSecurityService, PublicEventsService } from 'angular-auth-oidc-client';
import { filter } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'k-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  user: string;
  isAuthenticated: boolean;

  constructor(public router: Router, public oidcSecurityService: OidcSecurityService, private eventService: PublicEventsService) { }

  ngOnInit(): void {
    this.oidcSecurityService.userData$.pipe(filter(Boolean)).subscribe((v: any) => this.user = v.preferred_username);
    this.oidcSecurityService.isAuthenticated$.subscribe(e => this.isAuthenticated = e);
    setTimeout(() => {
      this.eventService
        .registerForEvents()
        .pipe(filter(notification => notification.type === EventTypes.CheckSessionReceived))
        .subscribe(value => {
          console.log('Session changed event receieved ', value);
          if (value && value.value === 'changed') {
            console.log('Session changed logging out');
            this.oidcSecurityService.logoff();
            this.router.navigateByUrl('/sign-out');
          }
        });
    }, 5 * 1000);
  }


  logout(): void {
    this.oidcSecurityService.logoff();
  }

}
