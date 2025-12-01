import { Injectable, OnDestroy, inject, isDevMode, signal } from '@angular/core';

import { CONFIG_DEFAULTS, ConfigService } from './config.service';

/**
 * Custom Check Session Service
 *
 * Workaround for angular-auth-oidc-client bug where the check session iframe
 * is created but the src is never set. This service manually implements
 * the OpenID Connect Session Management spec.
 *
 * @see https://openid.net/specs/openid-connect-session-1_0.html
 */
@Injectable({ providedIn: 'root' })
export class CheckSessionService implements OnDestroy {
  private readonly configService = inject(ConfigService);
  private checkSessionIframe: HTMLIFrameElement | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;
  private clientId = '';
  private sessionState = '';
  private checkSessionIframeUrl = '';
  private readonly debug = isDevMode();

  /** Signal that emits when session state changes (user logged out elsewhere) */
  readonly sessionChanged = signal(false);

  /**
   * Start the check session polling.
   * Reads interval from oidc.json config, defaults to 10 seconds.
   */
  start(): void {
    if (this.isRunning) {
      return;
    }

    // Get interval from shared config service
    this.configService.getConfig().subscribe({
      next: (config) => {
        const intervalSeconds =
          (config?.['checkSessionIntervalInSeconds'] as number) ??
          CONFIG_DEFAULTS.checkSessionIntervalInSeconds;
        this.initCheckSession(intervalSeconds);
      },
      error: () => {
        // Fallback to default if config fetch fails
        this.initCheckSession(CONFIG_DEFAULTS.checkSessionIntervalInSeconds);
      },
    });
  }

  private initCheckSession(intervalSeconds: number): void {
    // Get config from storage
    const configKey = Object.keys(sessionStorage).find((k) => k.startsWith('0-'));
    if (!configKey) {
      return;
    }

    try {
      const stored = JSON.parse(sessionStorage.getItem(configKey) || '{}');
      this.checkSessionIframeUrl = stored?.authWellKnownEndPoints?.checkSessionIframe;
      this.sessionState = stored?.session_state;
      this.clientId = configKey.replace('0-', '');

      if (!this.checkSessionIframeUrl || !this.sessionState) {
        return;
      }

      this.initIframe();
      this.startPolling(intervalSeconds);
      this.isRunning = true;
    } catch {
      // Failed to start check session - non-critical
    }
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.checkSessionIframe) {
      this.checkSessionIframe.remove();
      this.checkSessionIframe = null;
    }
    window.removeEventListener('message', this.handleMessage);
    this.isRunning = false;
  }

  ngOnDestroy(): void {
    this.stop();
  }

  private initIframe(): void {
    // Remove existing iframe if any
    const existing = document.getElementById('kp-check-session-iframe');
    existing?.remove();

    // Create new iframe
    this.checkSessionIframe = document.createElement('iframe');
    this.checkSessionIframe.id = 'kp-check-session-iframe';
    this.checkSessionIframe.style.display = 'none';
    this.checkSessionIframe.src = this.checkSessionIframeUrl;
    document.body.appendChild(this.checkSessionIframe);

    // Listen for postMessage responses
    window.addEventListener('message', this.handleMessage);
  }

  private startPolling(intervalSeconds: number): void {
    // Wait for iframe to load before first check
    this.checkSessionIframe?.addEventListener('load', () => {
      this.checkSession();
    });

    this.intervalId = setInterval(() => {
      this.checkSession();
    }, intervalSeconds * 1000);
  }

  private checkSession(): void {
    if (!this.checkSessionIframe?.contentWindow) {
      return;
    }

    // Send message to check session iframe per OIDC spec
    // Format: "client_id session_state"
    const message = `${this.clientId} ${this.sessionState}`;
    const origin = new URL(this.checkSessionIframeUrl).origin;

    this.checkSessionIframe.contentWindow.postMessage(message, origin);
  }

  private handleMessage = (event: MessageEvent): void => {
    // Verify origin matches the Identity Provider
    if (!this.checkSessionIframeUrl) return;

    const expectedOrigin = new URL(this.checkSessionIframeUrl).origin;
    if (event.origin !== expectedOrigin) return;

    const data = event.data;

    if (data === 'changed') {
      this.sessionChanged.set(true);
      this.stop();
    } else if (data === 'error' && this.debug) {
      console.error('[CheckSession] Error from IdP check session iframe');
    }
  };
}
