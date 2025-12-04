import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import {
  PassedInitialConfig,
  StsConfigHttpLoader,
  StsConfigLoader,
} from 'angular-auth-oidc-client';

import { AuthUtils } from './auth-utils';
import { environment } from '../../environments/environment';
import { ObjectUtils } from '../utils/object-utils';

export const httpLoaderFactory = (httpClient: HttpClient) => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const config$ = httpClient.get<any>(environment.config_url).pipe(
    map((v) => ObjectUtils.toCamel(v)),

    map((customConfig: any) => {
      const generateUrl = ObjectUtils.withDefault(customConfig.generateBaseUrl, false);
      let baseUrl: any;

      if (customConfig.baseUrl) {
        baseUrl = customConfig.baseUrl;
      } else if (generateUrl) {
        baseUrl = AuthUtils.generateBaseUrl();
      }
      return {
        authority: customConfig.authority,
        redirectUrl: ObjectUtils.withDefault(
          customConfig.redirectUrl,
          AuthUtils.suffixUrl(baseUrl, ObjectUtils.withDefault(customConfig.redirectPath, '#/sso')),
        ),
        clientId: customConfig.clientId,
        responseType: customConfig.responseType,
        scope: customConfig.scope,
        postLogoutRedirectUri: ObjectUtils.withDefault(
          customConfig.postLogoutRedirectUri,
          AuthUtils.suffixUrl(
            baseUrl,
            ObjectUtils.withDefault(customConfig.postLogoutPath, '#/sign-out'),
          ),
        ),
        // Disable library's broken check session - using custom CheckSessionService instead
        startCheckSession: false,
        checkSessionIntervalInSeconds: ObjectUtils.withDefault(
          customConfig.checkSessionIntervalInSeconds,
          10,
        ),
        secureRoutes: [customConfig.authority],
        silentRenew: ObjectUtils.withDefault(customConfig.silentRenew, false),
        silentRenewUrl: ObjectUtils.withDefault(
          customConfig.silentRenewUrl,
          AuthUtils.suffixUrl(
            baseUrl,
            ObjectUtils.withDefault(customConfig.slientRenewPath, 'silent-renew.html'),
          ),
        ),
        postLoginRoute: ObjectUtils.withDefault(customConfig.startupRoute, '/home'),
        forbiddenRoute: ObjectUtils.withDefault(customConfig.forbiddenRoute, '/forbidden'),
        unauthorizedRoute: ObjectUtils.withDefault(customConfig.unauthorizedRoute, '/unauthorized'),
        useRefreshToken: ObjectUtils.withDefault(customConfig.useRefreshToken, true),
        renewTimeBeforeTokenExpiresInSeconds: ObjectUtils.withDefault(
          customConfig.renewTimeBeforeTokenExpiresInSeconds,
          30,
        ),
        ignoreNonceAfterRefresh: ObjectUtils.withDefault(
          customConfig.ignoreNonceAfterRefresh,
          true,
        ), // this is required if the id_token is not returned
        triggerRefreshWhenIdTokenExpired: ObjectUtils.withDefault(
          customConfig.triggerRefreshWhenIdTokenExpired,
          false,
        ), // required when refreshing the browser if id_token is not updated after the first authentication
        triggerAuthorizationResultEvent: true,
        logLevel: ObjectUtils.withDefault(customConfig.logLevel, 0), // LogLevel.Debug,
        maxIdTokenIatOffsetAllowedInSeconds: ObjectUtils.withDefault(
          customConfig.maxIdTokenIatOffsetAllowedInSeconds,
          40,
        ),
        historyCleanupOff: ObjectUtils.withDefault(customConfig.historyCleanupOff, false),
        autoUserinfo: ObjectUtils.withDefault(customConfig.autoUserinfo, true),
        disableIatOffsetValidation: ObjectUtils.withDefault(
          customConfig.disableIatOffsetValidation,
          false,
        ),
      };
    }),
  );
  /* eslint-enable @typescript-eslint/no-explicit-any */
  return new StsConfigHttpLoader(config$);
};

export const authConfig: PassedInitialConfig = {
  loader: {
    provide: StsConfigLoader,
    useFactory: httpLoaderFactory,
    deps: [HttpClient],
  },
};
