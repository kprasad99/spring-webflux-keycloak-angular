import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { AutoLoginPartialRoutesGuard } from 'angular-auth-oidc-client';

import { HomeComponent } from './home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
    // canActivate: [AutoLoginPartialRoutesGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {}
