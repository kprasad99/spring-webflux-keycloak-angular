import { Routes } from '@angular/router';
import { authGuard } from './auth/auh-guard';

export const routes: Routes = [
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./home/home').then((m) => m.Home),
  },
  { path: 'sso', loadComponent: () => import('./sso/sso').then((m) => m.Sso) },
  { path: 'sign-out', loadComponent: () => import('./sign-out/sign-out').then((m) => m.SignOut) },
  {
    path: 'unauthorized',
    loadComponent: () => import('./unauthorized/unauthorized').then((m) => m.Unauthorized),
  },
  {
    path: 'auth-error',
    loadComponent: () => import('./auth-error/auth-error').then((m) => m.AuthError),
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: '**',
    loadComponent: () => import('./page-not-found/page-not-found').then((m) => m.PageNotFound),
  },
];
