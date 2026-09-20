import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';

import { map } from 'rxjs';

import { OidcSecurityService } from 'angular-auth-oidc-client';

import { AuthService } from '../auth/auth';

@Component({
  selector: 'kp-home',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatRippleModule,
    MatDividerModule,
    RouterOutlet,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block h-screen',
  },
})
export class Home {
  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly authService = inject(AuthService);

  protected readonly user = toSignal(
    this.oidcSecurityService.userData$.pipe(
      map(({ userData }) => userData?.name || userData?.preferred_username || ''),
    ),
    { initialValue: '' },
  );

  logout(): void {
    this.authService.logout().subscribe();
  }
}
