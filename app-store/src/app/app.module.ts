import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ServiceWorkerModule } from '@angular/service-worker';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthHttpConfigModule } from './auth/auth-http-config.module';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { SignOutComponent } from './sign-out/sign-out.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { environment } from '../environments/environment';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [AppComponent, SignOutComponent, UnauthorizedComponent, ForbiddenComponent],
  imports: [
    BrowserModule,
    FlexLayoutModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    BrowserAnimationsModule,
    AuthHttpConfigModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
