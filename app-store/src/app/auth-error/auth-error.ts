import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';

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
        'There is a time difference between your device and the authentication server. This prevents secure authentication.',
      suggestions: [
        "Check your device's Date & Time settings and enable automatic time sync",
        'Wait a few seconds for the time to synchronize, then retry',
        'If the issue persists, the server time may be out of sync - contact your system administrator',
        'System administrators: Verify NTP is configured correctly on the authentication server',
      ],
      showRetry: true,
    },
    network: {
      icon: 'wifi_off',
      iconColor: 'text-red-500',
      title: 'Network Connection Error',
      message:
        'Unable to connect to the authentication server. This could be due to network issues or SSL certificate problems.',
      suggestions: [
        'Check your internet connection and verify you are connected to the correct network',
        'If using a self-signed SSL certificate, open the authentication server URL in a new browser tab and accept the certificate',
        'Check browser console (F12 → Console) for SSL/certificate errors',
        'Verify VPN settings if applicable',
        'Verify firewall settings are not blocking access',
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
