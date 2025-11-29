import { HttpClient } from '@angular/common/http';
import {
  PassedInitialConfig,
  StsConfigHttpLoader,
  StsConfigLoader,
} from 'angular-auth-oidc-client';
import { map } from 'rxjs/operators';
import { AuthUtils } from './auth-utils';
import { environment } from '../../environments/environment';

export const httpLoaderFactory = (httpClient: HttpClient) => {
  const config$ = httpClient.get<any>(environment.oidc_url).pipe(
    map((v) => AuthUtils.toCamel(v)),

    map((customConfig: any) => {
      const generateUrl = AuthUtils.toBoolWithDefault(customConfig.generateBaseUrl, false);
      let baseUrl: any;

      if (customConfig.baseUrl) {
        baseUrl = customConfig.baseUrl;
      } else if (generateUrl) {
        baseUrl = AuthUtils.generateBaseUrl();
      }
      return {
        authority: customConfig.authority,
        redirectUrl: AuthUtils.withDefault(
          customConfig.redirectUrl,
          AuthUtils.suffixUrl(baseUrl, AuthUtils.withDefault(customConfig.redirectPath, '#/sso')),
        ),
        clientId: customConfig.clientId,
        responseType: customConfig.responseType,
        scope: customConfig.scope,
        postLogoutRedirectUri: AuthUtils.withDefault(
          customConfig.postLogoutRedirectUri,
          AuthUtils.suffixUrl(
            baseUrl,
            AuthUtils.withDefault(customConfig.postLogoutPath, '#/sign-out'),
          ),
        ),
        startCheckSession: AuthUtils.toBoolWithDefault(customConfig.startCheckSession, false),
        silentRenew: AuthUtils.toBoolWithDefault(customConfig.silentRenew, false),
        silentRenewUrl: AuthUtils.withDefault(
          customConfig.silentRenewUrl,
          AuthUtils.suffixUrl(
            baseUrl,
            AuthUtils.withDefault(customConfig.slientRenewPath, 'silent-renew.html'),
          ),
        ),
        postLoginRoute: AuthUtils.withDefault(customConfig.startupRoute, '/home'),
        forbiddenRoute: AuthUtils.withDefault(customConfig.forbiddenRoute, '/forbidden'),
        unauthorizedRoute: AuthUtils.withDefault(customConfig.unauthorizedRoute, '/unauthorized'),
        useRefreshToken: AuthUtils.toBoolWithDefault(customConfig.useRefreshToken, false),
        ignoreNonceAfterRefresh: AuthUtils.toBoolWithDefault(
          customConfig.ignoreNonceAfterRefresh,
          true,
        ), // this is required if the id_token is not returned
        triggerRefreshWhenIdTokenExpired: AuthUtils.toBoolWithDefault(
          customConfig.triggerRefreshWhenIdTokenExpired,
          false,
        ), // required when refreshing the browser if id_token is not updated after the first authentication
        triggerAuthorizationResultEvent: true,
        logLevel: AuthUtils.toIntWithDefault(customConfig.logLevel, 0), // LogLevel.Debug,
        maxIdTokenIatOffsetAllowedInSeconds: AuthUtils.toIntWithDefault(
          customConfig.maxIdTokenIatOffsetAllowedInSeconds,
          40,
        ),
        historyCleanupOff: AuthUtils.toBoolWithDefault(customConfig.historyCleanupOff, false),
        autoUserinfo: AuthUtils.toBoolWithDefault(customConfig.autoUserinfo, true),
        disableIatOffsetValidation: AuthUtils.toBoolWithDefault(
          customConfig.disableIatOffsetValidation,
          false,
        ),
      };
    }),
  );

  return new StsConfigHttpLoader(config$);
};

export const authConfig: PassedInitialConfig = {
  loader: {
    provide: StsConfigLoader,
    useFactory: httpLoaderFactory,
    deps: [HttpClient],
  },
};
