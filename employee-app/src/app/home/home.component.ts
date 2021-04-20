import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'k-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  user: string;
  isAuthenticated: boolean;

  constructor(private http: HttpClient, public oidcSecurityService: OidcSecurityService) {

  }

  ngOnInit(): void {
    this.oidcSecurityService.userData$.pipe(filter(Boolean)).subscribe((v: any) => this.user = v.preferred_username);
    this.oidcSecurityService.isAuthenticated$.subscribe(e => this.isAuthenticated = e);
  }


  logout(): void {
    this.oidcSecurityService.logoff();
  }

}
