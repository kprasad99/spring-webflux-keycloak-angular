import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

import { take } from 'rxjs';

import { AuthService } from '../auth/auth';

@Component({
  selector: 'kp-sso',
  imports: [MatProgressSpinnerModule, MatButtonModule],
  templateUrl: './sso.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './sso.scss',
})
export class Sso implements OnInit {
  protected readonly errMessage = signal<string | null>(null);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  retry(): void {
    this.errMessage.set(null);
    this.authService.login();
  }

  ngOnInit(): void {
    // Do NOT call authorize() here and do NOT take the first isAuthenticated$
    // value (it is false until checkAuth finishes). Wait for auth-ready instead.
    this.authService.isAuthenticatedAfterCheck$
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((isAuthenticated) => {
        if (isAuthenticated) {
          const redirectUrl = this.authService.consumeRedirectUrl() ?? '/home';
          void this.router.navigateByUrl(redirectUrl);
          return;
        }

        // Callback failures are handled in App (auth-error). Only send users who
        // opened /sso directly, with no in-flight OIDC callback, to unauthorized.
        if (this.authService.hasOidcCallbackParams()) {
          return;
        }

        this.router.navigate(['/unauthorized'], {
          queryParams: { reason: 'not-authenticated' },
          replaceUrl: true,
        });
      });
  }
}
