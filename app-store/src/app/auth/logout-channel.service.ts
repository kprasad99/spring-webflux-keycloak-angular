import { Injectable, OnDestroy, inject, signal } from '@angular/core';

import { CONFIG_DEFAULTS, ConfigService } from './config.service';

/** Channel name for BroadcastChannel (same-origin only) */
const BROADCAST_CHANNEL_NAME = 'sso-logout';

/** LocalStorage key for cross-subdomain logout events */
const STORAGE_LOGOUT_KEY = 'sso-logout-event';

/**
 * Service for handling cross-tab/cross-subdomain logout notifications.
 *
 * Supports two modes:
 * 1. BroadcastChannel (default) - Fast, same-origin only
 * 2. LocalStorage events - Works across subdomains
 *
 * Set `useLocalStorageLogout: true` in oidc.json to enable localStorage mode
 * for cross-subdomain logout detection.
 */
@Injectable({ providedIn: 'root' })
export class LogoutChannelService implements OnDestroy {
  private readonly configService = inject(ConfigService);
  private broadcastChannel?: BroadcastChannel;
  private useLocalStorage = false;
  private storageListener?: (event: StorageEvent) => void;

  /** Signal that emits when logout is received from another tab/app */
  readonly logoutReceived = signal(false);

  /**
   * Initialize the logout channel.
   * Reads config from oidc.json to determine which method to use.
   */
  init(): void {
    this.configService.getConfig().subscribe({
      next: (config) => {
        this.useLocalStorage =
          (config?.['useLocalStorageLogout'] as boolean) ?? CONFIG_DEFAULTS.useLocalStorageLogout;
        this.setup();
      },
      error: () => {
        // Default to BroadcastChannel
        this.useLocalStorage = CONFIG_DEFAULTS.useLocalStorageLogout;
        this.setup();
      },
    });
  }

  private setup(): void {
    if (this.useLocalStorage) {
      this.setupLocalStorageListener();
    } else {
      this.setupBroadcastChannel();
    }
  }

  /**
   * Set up BroadcastChannel for same-origin cross-tab logout.
   * This is faster but only works within the same origin.
   */
  private setupBroadcastChannel(): void {
    if (typeof BroadcastChannel === 'undefined') {
      return;
    }

    this.broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    this.broadcastChannel.onmessage = (event) => {
      if (event.data === 'logout') {
        this.logoutReceived.set(true);
      }
    };
  }

  /**
   * Set up localStorage event listener for cross-subdomain logout.
   * localStorage events fire across all tabs/windows of the same domain,
   * including subdomains if cookies are set correctly.
   */
  private setupLocalStorageListener(): void {
    this.storageListener = (event: StorageEvent) => {
      if (event.key === STORAGE_LOGOUT_KEY && event.newValue) {
        this.logoutReceived.set(true);
      }
    };

    window.addEventListener('storage', this.storageListener);
  }

  /**
   * Broadcast logout to other tabs/apps.
   * Uses either BroadcastChannel or localStorage depending on config.
   */
  broadcastLogout(): void {
    if (this.useLocalStorage) {
      // Set localStorage to trigger storage event in other tabs/windows
      localStorage.setItem(STORAGE_LOGOUT_KEY, Date.now().toString());
      // Clean up immediately - the event has already been dispatched
      localStorage.removeItem(STORAGE_LOGOUT_KEY);
    } else {
      this.broadcastChannel?.postMessage('logout');
    }
  }

  /**
   * Stop listening and clean up resources.
   */
  stop(): void {
    this.broadcastChannel?.close();
    this.broadcastChannel = undefined;

    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
      this.storageListener = undefined;
    }
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
