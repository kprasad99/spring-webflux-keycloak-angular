import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';

import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { SignOutComponent } from './sign-out/sign-out.component';
import { SsoComponent } from './sso/sso.component';
import { HttpClientModule } from '@angular/common/http';
import { AuthConfigModule } from './auth-config/auth-config.module';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    AppComponent,
    UnauthorizedComponent,
    ForbiddenComponent,
    SignOutComponent,
    SsoComponent
  ],
  imports: [
    BrowserModule,
    FlexLayoutModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    AuthConfigModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
