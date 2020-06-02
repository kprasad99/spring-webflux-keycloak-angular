import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SsoComponent } from './sso/sso.component';


const routes: Routes = [{
  path: 'sso',
  component: SsoComponent
},
{
  path: 'home',
  loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
},{
  path: 'home&state',
  pathMatch: 'full',
  redirectTo: 'home'
},
{
  path: '',
  pathMatch: 'full',
  redirectTo: 'home'
}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: true
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
