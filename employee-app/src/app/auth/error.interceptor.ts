import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import { Router } from '@angular/router';
import { inject } from '@angular/core';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  return next(req).pipe(
    catchError((err: any) => {
      if (err instanceof HttpErrorResponse) {
        // Handle HTTP errors
        if (err.status === 401) {
          router.navigateByUrl('/sign-out');
        }
        if (err.status === 403) {
          router.navigateByUrl('/forbidden');
        }
      }

      // Re-throw the error to propagate it further
      return throwError(() => err);
    })
  );
};
