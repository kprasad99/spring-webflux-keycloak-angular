import { Component, OnInit, OnDestroy } from '@angular/core';
import { OidcConfigService, OidcSecurityService, OidcClientNotification } from 'angular-auth-oidc-client';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'k-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  isConfigurationLoaded: boolean;
  userData: any;
  isAuthenticated: boolean;

  apps = [];

  constructor(private http: HttpClient, public oidcSecurityService: OidcSecurityService) {

  }

  ngOnInit() {
    this.http.get<any[]>('assets/config/apps.json').subscribe(e => { this.apps = e });
    this.oidcSecurityService.checkAuth().subscribe(auth => {
      this.oidcSecurityService.userData$.subscribe(e => this.userData = e);
      this.oidcSecurityService.isAuthenticated$.subscribe(e => {
        this.isAuthenticated = e;
      })
    });

  }

  ngOnDestroy(): void { }

  login() {
    this.oidcSecurityService.authorize();
  }

  logout() {
    this.oidcSecurityService.logoff();
  }

  launch(app) {
    const token = this.oidcSecurityService.getToken();
    window.open(`${app.url}?src=${encodeURI(window.location.href)}`);
  }

}