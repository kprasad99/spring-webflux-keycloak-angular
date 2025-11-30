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

type ErrorReason = 'time-skew' | 'network' | 'generic';

interface ErrorConfig {
  icon: string;
  iconColor: string;
  title: string;
  message: string;
  suggestions: string[];
  showRetry: boolean;
}

@Component({
  selector: 'kp-auth-error',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './auth-error.html',
  styleUrl: './auth-error.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthError implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly oidcService = inject(OidcSecurityService);

  readonly reason = signal<ErrorReason>('generic');
  readonly clientTime = signal(new Date());

  private readonly errorConfigs: Record<ErrorReason, ErrorConfig> = {
    'time-skew': {
      icon: 'schedule',
      iconColor: 'text-amber-500',
      title: 'Clock Synchronization Error',
      message:
        "Your device's clock appears to be out of sync with the server. This prevents secure authentication.",
      suggestions: [
        "Open your device's Date & Time settings",
        'Enable "Set time automatically" or sync with network time',
        'Wait a few seconds for the time to synchronize',
        'Click "Retry Authentication" below',
      ],
      showRetry: true,
    },
    network: {
      icon: 'wifi_off',
      iconColor: 'text-red-500',
      title: 'Network Connection Error',
      message:
        'Unable to connect to the authentication server. Please check your internet connection.',
      suggestions: [
        'Check your internet connection',
        'Verify you are connected to the correct network',
        'Try disabling VPN if enabled',
        'Contact your network administrator if the problem persists',
      ],
      showRetry: true,
    },
    generic: {
      icon: 'error_outline',
      iconColor: 'text-red-500',
      title: 'Authentication Error',
      message: 'An unexpected error occurred during authentication. Please try again.',
      suggestions: [
        'Clear your browser cache and cookies',
        'Try using a different browser',
        'Contact support if the problem persists',
      ],
      showRetry: true,
    },
  };

  readonly config = computed(() => this.errorConfigs[this.reason()]);

  ngOnInit() {
    const reason = this.route.snapshot.queryParamMap.get('reason') as ErrorReason;
    if (reason && this.errorConfigs[reason]) {
      this.reason.set(reason);
    }
    this.clientTime.set(new Date());
  }

  retry(): void {
    this.oidcService.authorize();
  }
}
