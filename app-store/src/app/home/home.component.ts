import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { filter, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'k-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  user: string;
  apps = [];

  constructor(public http: HttpClient, public oidcSecurityService: OidcSecurityService) { }

  ngOnInit(): void {
    this.oidcSecurityService.userData$.pipe(filter(Boolean)).subscribe((v: any) => this.user = v.preferred_username);
    this.http.get('./assets/apps.json').subscribe(v => this.apps = v as any);
    this.oidcSecurityService.checkSessionChanged$.pipe(switchMap(v => this.oidcSecurityService.checkAuthIncludingServer()))
      .subscribe(v => {
        console.log(v);
      });
  }

  logout(): void {
    console.log('start logoff');
    this.oidcSecurityService.logoff();
  }

}
