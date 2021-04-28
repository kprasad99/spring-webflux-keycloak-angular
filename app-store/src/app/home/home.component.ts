import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventTypes, OidcSecurityService, PublicEventsService } from 'angular-auth-oidc-client';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'k-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  user: string;
  apps = [];

  constructor(public http: HttpClient, public router: Router, public oidcSecurityService: OidcSecurityService,
              private eventService: PublicEventsService) { }

  ngOnInit(): void {
    this.oidcSecurityService.userData$.pipe(filter(Boolean)).subscribe((v: any) => this.user = v.preferred_username);
    this.http.get('./assets/apps.json').subscribe(v => this.apps = v as any);
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
    console.log('start logoff');
    this.oidcSecurityService.logoff();
  }

}
