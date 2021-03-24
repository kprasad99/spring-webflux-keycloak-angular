import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthModule, OidcConfigService, OidcSecurityService } from 'angular-auth-oidc-client';
import { HttpClient } from '@angular/common/http';

import { map, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthUtils } from './auth-utils';

export function configureAuth(oidcConfigService: OidcConfigService, httpClient: HttpClient) {
  const setupAction$ = httpClient.get<any>(environment.oidc_url).pipe(
    map((config) => {
      const generateUrl = AuthUtils.toBoolWithDefault(config.generateUrl, false);
      let baseUrl;
      if (config.baseUrl) {
        baseUrl = AuthUtils.suffixUrl(config.baseUrl, config.appName)
      } else if (generateUrl) {
        baseUrl = AuthUtils.suffixUrl(config.baseUrl, config.appName)
      }
      return {
        stsServer: config.stsServer,
        redirectUrl: AuthUtils.withDefault(config.redirectUrl, baseUrl),
        clientId: config.clientId,
        responseType: config.responseType,
        scope: config.scope,
        postLogoutRedirectUri: config.postLogoutRedirectUri,
        startCheckSession: AuthUtils.toBoolWithDefault(config.startCheckSession, false),
        triggerAuthorizationResultEvent: true,
        silentRenew: AuthUtils.toBoolWithDefault(config.silentRenew, false),
        silentRenewUrl: config.silentRenewUrl,
//        renewTimeBeforeTokenExpiresInSeconds: AuthUtils.toIntWithDefault(config.renewTimeBeforeTokenExpiresInSeconds, 30),
        postLoginRoute: config.startupRoute,
        forbiddenRoute: config.forbiddenRoute,
        unauthorizedRoute: config.unauthorizedRoute,
        logLevel: AuthUtils.toIntWithDefault(config.logLevel, 0), // LogLevel.Debug,
        maxIdTokenIatOffsetAllowedInSeconds: AuthUtils.toIntWithDefault(config.maxIdTokenIatOffsetAllowedInSeconds, 60),
        historyCleanupOff: AuthUtils.toBoolWithDefault(config.historyCleanupOff, false),
        autoUserinfo: AuthUtils.toBoolWithDefault(config.autoUserinfo, true),
        disableIatOffsetValidation: AuthUtils.toBoolWithDefault(config.disableIatOffsetValidation, false)
      };
    }),
    switchMap((config) => oidcConfigService.withConfig(config))
  );

  return () => setupAction$.toPromise();
}

@NgModule({
  imports: [AuthModule.forRoot()],
  providers: [
    OidcSecurityService,
    OidcConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: configureAuth,
      deps: [OidcConfigService, HttpClient],
      multi: true,
    },
  ],
  exports: [CommonModule, AuthModule],
})
export class AuthConfigModule { }