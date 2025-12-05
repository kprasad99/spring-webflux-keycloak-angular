import {
  ApplicationConfig,
  isDevMode,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MAT_RIPPLE_GLOBAL_OPTIONS } from '@angular/material/core';
import { MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withHashLocation, withInMemoryScrolling } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';

import { provideAuth } from 'angular-auth-oidc-client';

import { routes } from './app.routes';
import { authConfig } from './auth/auth-http.config';
import { httpErrorInterceptor } from './auth/interceptors/http-error.interceptor';
import { tokenInterceptor } from './auth/interceptors/token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: MAT_ICON_DEFAULT_OPTIONS, useValue: { fontSet: 'material-symbols-outlined' } },
    { provide: MAT_RIPPLE_GLOBAL_OPTIONS, useValue: { disabled: false } },
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      withHashLocation(),
    ),
    provideHttpClient(withInterceptors([tokenInterceptor, httpErrorInterceptor])),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideAuth(authConfig),
  ],
};
