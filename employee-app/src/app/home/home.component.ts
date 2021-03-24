import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'k-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  userData: any;
  isAuthenticated: boolean;

  constructor(private http: HttpClient,
    public oidcSecurityService: OidcSecurityService) {

  }

  ngOnInit(): void {
    this.oidcSecurityService.checkAuth().subscribe(auth => {
      this.oidcSecurityService.userData$.subscribe(e => this.userData = e);
      this.oidcSecurityService.isAuthenticated$.subscribe(e => {
        this.isAuthenticated = e;
      })
    });
  }

  login() {
    this.oidcSecurityService.authorize();
  }

  logout() {
    this.oidcSecurityService.logoff();
  }

}
