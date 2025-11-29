import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OidcSecurityService } from 'angular-auth-oidc-client';

type UnauthorizedReason = 'forbidden' | 'session-expired' | 'session-ended' | 'default';

interface ReasonConfig {
  icon: string;
  iconColor: string;
  title: string;
  message: string;
  showLogin: boolean;
}

@Component({
  selector: 'kp-unauthorized',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './unauthorized.html',
  styleUrl: './unauthorized.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Unauthorized implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly oidcService = inject(OidcSecurityService);

  readonly reason = signal<UnauthorizedReason>('default');

  private readonly reasonConfigs: Record<UnauthorizedReason, ReasonConfig> = {
    forbidden: {
      icon: 'block',
      iconColor: 'text-red-500',
      title: 'Access Denied',
      message:
        "You don't have permission to access this resource. Please contact your administrator if you believe this is an error.",
      showLogin: false,
    },
    'session-expired': {
      icon: 'timer_off',
      iconColor: 'text-amber-500',
      title: 'Session Expired',
      message:
        'Your session has expired due to inactivity or token expiration. Please sign in again to continue.',
      showLogin: true,
    },
    'session-ended': {
      icon: 'logout',
      iconColor: 'text-blue-500',
      title: 'Session Ended',
      message:
        'Your session was ended, possibly from another application or browser tab. Please sign in again to continue.',
      showLogin: true,
    },
    default: {
      icon: 'block',
      iconColor: 'text-red-500',
      title: 'Access Denied',
      message:
        "You don't have permission to access this resource. Please contact your administrator if you believe this is an error.",
      showLogin: false,
    },
  };

  readonly config = computed(() => this.reasonConfigs[this.reason()]);

  ngOnInit() {
    const reason = this.route.snapshot.queryParamMap.get('reason') as UnauthorizedReason;
    if (reason && this.reasonConfigs[reason]) {
      this.reason.set(reason);
    }
  }

  login(): void {
    this.oidcService.authorize();
  }
}
