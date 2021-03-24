import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable } from 'rxjs';

@Component({
  selector: 'k-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  user: string;
  apps = [];

  constructor(public http: HttpClient, public oidcSecurityService: OidcSecurityService) { }

  ngOnInit() {
    this.oidcSecurityService.userData$.subscribe(v => this.user = v.preferred_username);
    this.http.get('/assets/apps.json').subscribe(v => this.apps = <any>v);
  }

  logout() {
    console.log('start logoff');
    this.oidcSecurityService.logoff();
  }

}
