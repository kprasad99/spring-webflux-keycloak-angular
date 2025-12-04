import { inject, Injectable, NgZone, OnDestroy, signal } from '@angular/core';

import { Router } from '@angular/router';

import { OidcSecurityService } from 'angular-auth-oidc-client';

/** Default idle timeout in minutes */
const DEFAULT_IDLE_TIMEOUT_MINUTES = 15;

/** Events that indicate user activity */
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const;

/**
 * Idle Service
 *
 * Monitors user activity and logs out users after a period of inactivity.
 * This is client-side idle detection, independent of server-side session timeouts.
 *
 * Features:
 * - Configurable idle timeout
 * - Runs outside Angular zone for performance (no change detection on activity)
 * - Automatically stops when user logs out
 * - Redirects to auth-error page with idle-specific messaging
 */
@Injectable({ providedIn: 'root' })
export class IdleService implements OnDestroy {
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);
  private readonly oidcService = inject(OidcSecurityService);

  private timeoutId?: ReturnType<typeof setTimeout>;
  private idleTimeoutMs = DEFAULT_IDLE_TIMEOUT_MINUTES * 60 * 1000;
  private isRunning = false;
  private boundResetTimer = this.resetTimer.bind(this);

  /** Signal indicating user has been idle and was logged out */
  readonly idleLogout = signal(false);

  /**
   * Start monitoring user activity.
   * @param timeoutMinutes - Minutes of inactivity before logout (default: 15)
   */
  start(timeoutMinutes?: number): void {
    if (this.isRunning) {
      return;
    }

    if (timeoutMinutes && timeoutMinutes > 0) {
      this.idleTimeoutMs = timeoutMinutes * 60 * 1000;
    }

    // Run outside Angular zone to avoid triggering change detection on every activity event
    this.ngZone.runOutsideAngular(() => {
      ACTIVITY_EVENTS.forEach((event) => {
        document.addEventListener(event, this.boundResetTimer, { passive: true });
      });

      this.resetTimer();
    });

    this.isRunning = true;
  }

  /**
   * Stop monitoring user activity.
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.clearTimeout();

    ACTIVITY_EVENTS.forEach((event) => {
      document.removeEventListener(event, this.boundResetTimer);
    });

    this.isRunning = false;
  }

  ngOnDestroy(): void {
    this.stop();
  }

  /**
   * Reset the idle timer on user activity.
   */
  private resetTimer(): void {
    this.clearTimeout();

    this.timeoutId = setTimeout(() => {
      this.onIdle();
    }, this.idleTimeoutMs);
  }

  private clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }

  /**
   * Called when user has been idle for the configured timeout period.
   */
  private onIdle(): void {
    this.stop();
    this.idleLogout.set(true);

    // Run navigation inside Angular zone
    this.ngZone.run(() => {
      // Log out locally (don't call IdP - session may still be valid there)
      this.oidcService.logoffLocal();

      // Navigate to auth-error page with idle reason
      this.router.navigate(['/auth-error'], {
        queryParams: { reason: 'idle' },
        replaceUrl: true,
      });
    });
  }
}
