import { inject, Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { first, map, Observable, shareReplay } from 'rxjs';

import camelCase from 'lodash-es/camelCase';

import { environment } from '../environments/environment';

/** Generic config type - equivalent to map[string]any in Go */
export type AppConfig = Record<string, unknown>;

/** Default config values */
export const CONFIG_DEFAULTS = {
  checkSessionIntervalInSeconds: 10,
  useLocalStorageLogout: false,
} as const;

/**
 * Generic service for loading and caching JSON configuration.
 * Returns config as Record<string, unknown> (map[string]any).
 *
 * URL is configured via environment:
 * - Dev: ./oidc.json
 * - Prod: ./conf
 */
@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly http = inject(HttpClient);
  private config$?: Observable<AppConfig>;

  /**
   * Get the configuration as a generic map.
   * The config is cached after the first fetch using shareReplay.
   */
  getConfig(): Observable<AppConfig> {
    if (!this.config$) {
      this.config$ = this.http.get<AppConfig>(environment.config_url).pipe(
        map((v) => this.toCamel(v)),
        first(),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }
    return this.config$;
  }

  /**
   * Get a specific config value with type casting.
   *
   * @param key - The config key to retrieve
   * @param defaultValue - Default value if key doesn't exist
   */
  getValue<T>(key: string, defaultValue: T): Observable<T> {
    return this.getConfig().pipe(map((config) => (config[key] as T) ?? defaultValue));
  }

  /**
   * Clear the cached config (useful for testing or config reload).
   */
  clearCache(): void {
    this.config$ = undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toCamel(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((v) => this.toCamel(v));
    } else if (obj !== null && obj.constructor === Object) {
      return Object.keys(obj).reduce(
        (result, key) => ({
          ...result,
          [camelCase(key)]: this.toCamel(obj[key]),
        }),
        {},
      );
    }
    return obj;
  }
}
