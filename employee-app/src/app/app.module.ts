import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';


import { OidcConfigService, AuthModule } from 'angular-auth-oidc-client';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

import { FlexLayoutModule } from '@angular/flex-layout';
import { map, switchMap } from 'rxjs/operators';
import { SsoComponent } from './sso/sso.component';
import { TokenInterceptor } from './token.interceptor';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';


const oidc_configuration = '/assets/config/oidc.json';

export function loadConfig(oidcConfigService: OidcConfigService, http: HttpClient) {
  const setupAction$ = http.get<any>(oidc_configuration).pipe(
    map((customConfig) => {
      return {
        stsServer: customConfig.stsServer,
        redirectUrl: customConfig.redirect_url,
        clientId: customConfig.client_id,
        responseType: customConfig.response_type,
        // scope: customConfig.scope,
        postLogoutRedirectUri: customConfig.post_logout_redirect_uri,
        startCheckSession: customConfig.start_checksession,
        silentRenew: customConfig.silent_renew,
        silentRenewUrl: customConfig.redirect_url + '/silent-renew.html',
        //  postLoginRoute: customConfig.startup_route,
        //  forbiddenRoute: customConfig.forbidden_route,
        //  unauthorizedRoute: customConfig.unauthorized_route,
        logLevel: customConfig.logLevel, // LogLevel.Debug,
        maxIdTokenIatOffsetAllowedInSeconds: customConfig.max_id_token_iat_offset_allowed_in_seconds,
        historyCleanupOff: true,
        // autoUserinfo: false,
      };
    }),
    switchMap((config) => oidcConfigService.withConfig(config))
  );

  return () => setupAction$.toPromise();
}

@NgModule({
  declarations: [
    AppComponent,
    SsoComponent
  ],
  imports: [
    BrowserModule,
    FlexLayoutModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatRippleModule,
    MatMenuModule,
    MatDividerModule,
    AppRoutingModule,
    HttpClientModule,
    AuthModule.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    BrowserAnimationsModule
  ],
  providers: [
    OidcConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: loadConfig,
      deps: [OidcConfigService, HttpClient],
      multi: true,
    },
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' } },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {
  }

}
