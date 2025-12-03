import { Routes } from '@angular/router';

export const HomeRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home').then((m) => m.Home),
    children: [
      {
        path: '',
        loadComponent: () => import('./apps-list/apps-list').then((m) => m.AppsList),
      },
    ],
  },
];
