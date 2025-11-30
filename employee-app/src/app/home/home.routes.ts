import { Routes } from '@angular/router';

export const HomeRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home').then((m) => m.Home),
    children: [
      { path: '', redirectTo: 'employee', pathMatch: 'full' },
      {
        path: 'employee',
        loadComponent: () => import('./employee/employee').then((m) => m.Employee),
      },
    ],
  },
];
