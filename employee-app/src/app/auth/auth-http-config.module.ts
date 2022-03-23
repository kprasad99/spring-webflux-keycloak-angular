import { AuthModule, LogLevel, StsConfigHttpLoader, StsConfigLoader } from 'angular-auth-oidc-client';

import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { map } from 'rxjs/operators';

import { AuthUtils } from './auth-utils';
import { environment } from 'src/environments/environment';

export const httpLoaderFactory = (httpClient: HttpClient) => {
  const config$ = httpClient.get<any>(environment.oidc_url).pipe(
    map(v => AuthUtils.toCamel(v)),
    map((customConfig: any) => {
      const generateUrl = AuthUtils.toBoolWithDefault(customConfig.generateUrl, false);
      let baseUrl: any;
      if (customConfig.baseUrl) {
        baseUrl = AuthUtils.suffixUrl(customConfig.baseUrl, customConfig.appName);
      } else if (generateUrl) {
        baseUrl = AuthUtils.suffixUrl(customConfig.baseUrl, customConfig.appName);
      }
      return {
        authority: customConfig.authority,
        triggerAuthorizationResultEvent: AuthUtils.toBoolWithDefault(
          customConfig.triggerAuthorizationResultEvent,
          false
        ),
        redirectUrl: AuthUtils.withDefault(customConfig.redirectUrl, baseUrl),
        clientId: customConfig.clientId,
        responseType: customConfig.responseType,
        scope: customConfig.scope,
        postLogoutRedirectUri: customConfig.postLogoutRedirectUri,
        startCheckSession: AuthUtils.toBoolWithDefault(customConfig.startCheckSession, false),
        silentRenew: AuthUtils.toBoolWithDefault(customConfig.silentRenew, false),
        silentRenewUrl: customConfig.silentRenewUrl,
        postLoginRoute: AuthUtils.withDefault(customConfig.postLoginRoute, '/home'),
        forbiddenRoute: AuthUtils.withDefault(customConfig.forbiddenRoute, '/forbidden'),
        unauthorizedRoute: AuthUtils.withDefault(customConfig.unauthorizedRoute, '/unauthorized'),
        logLevel: LogLevel.None, // LogLevel.Debug,
        maxIdTokenIatOffsetAllowedInSeconds: AuthUtils.toIntWithDefault(
          customConfig.maxIdTokenIatOffsetAllowedInSeconds,
          60
        ),
        disableIatOffsetValidation: AuthUtils.toBoolWithDefault(customConfig.disableIatOffsetValidation, false),
        historyCleanupOff: AuthUtils.toBoolWithDefault(customConfig.historyCleanupOff, true),
        autoUserInfo: AuthUtils.toBoolWithDefault(customConfig.autoUserInfo, true)
      };
    })
  );

  return new StsConfigHttpLoader(config$);
};

@NgModule({
  imports: [
    AuthModule.forRoot({
      loader: {
        provide: StsConfigLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  exports: [AuthModule]
})
export class AuthHttpConfigModule {}
