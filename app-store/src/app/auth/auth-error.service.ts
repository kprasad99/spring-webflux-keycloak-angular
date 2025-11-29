import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { EventTypes } from 'angular-auth-oidc-client';

export type AuthErrorType =
  | 'time-skew'
  | 'network'
  | 'session-expired'
  | 'session-ended'
  | 'not-authenticated'
  | 'generic';

interface ErrorInfo {
  type: AuthErrorType;
  message: unknown;
}

@Injectable({ providedIn: 'root' })
export class AuthErrorService {
  private readonly router = inject(Router);

  /**
   * Handle auth errors and navigate to appropriate error pages.
   * Returns true if error was handled, false if it should be ignored.
   */
  handleAuthError(error: unknown, eventType: EventTypes): boolean {
    const errorStr = this.errorToString(error).toLowerCase();

    // "No token" errors are normal after logout - don't redirect to error page
    // The auth guard will handle redirecting to login if needed
    if (this.isNotAuthenticatedError(errorStr)) {
      console.log('User not authenticated - guard will handle login redirect');
      return false; // Don't handle - let guard do its job
    }

    const errorInfo = this.categorizeError(error, eventType);
    console.error(`Auth error [${errorInfo.type}]:`, errorInfo.message);

    switch (errorInfo.type) {
      case 'time-skew':
      case 'network':
      case 'generic':
        this.router.navigate(['/auth-error'], {
          queryParams: { reason: errorInfo.type },
          replaceUrl: true,
        });
        break;

      case 'session-expired':
      case 'session-ended':
        this.router.navigate(['/unauthorized'], {
          queryParams: { reason: errorInfo.type },
          replaceUrl: true,
        });
        break;
    }

    return true;
  }

  /**
   * Check if error indicates user is simply not authenticated (not an error condition)
   */
  private isNotAuthenticatedError(errorStr: string): boolean {
    const notAuthIndicators = [
      'no refresh token',
      'no token',
      'not authenticated',
      'please login',
      'login required',
      'no id_token',
      'no access_token',
    ];

    return notAuthIndicators.some((indicator) => errorStr.includes(indicator));
  }

  /**
   * Categorize error based on error content and event type
   */
  private categorizeError(error: unknown, eventType: EventTypes): ErrorInfo {
    const errorStr = this.errorToString(error).toLowerCase();

    // Time skew indicators
    if (this.isTimeSkewError(errorStr)) {
      return { type: 'time-skew', message: error };
    }

    // Network errors
    if (this.isNetworkError(errorStr)) {
      return { type: 'network', message: error };
    }

    // Session/token expired based on event type
    if (eventType === EventTypes.SilentRenewFailed) {
      return { type: 'session-expired', message: error };
    }

    // Generic error
    return { type: 'generic', message: error };
  }

  /**
   * Check if error indicates time skew
   */
  private isTimeSkewError(errorStr: string): boolean {
    const timeSkewIndicators = [
      'maxoffsetexpired',
      'max_offset',
      'iat',
      'issued at',
      'issued_at',
      'clock',
      'time skew',
      'timeskew',
      'token used before',
      'token not yet valid',
      'nbf',
      'not before',
    ];

    return timeSkewIndicators.some((indicator) => errorStr.includes(indicator));
  }

  /**
   * Check if error indicates network issue
   */
  private isNetworkError(errorStr: string): boolean {
    const networkIndicators = [
      'network',
      'fetch',
      'failed to fetch',
      'net::',
      'timeout',
      'connection refused',
      'econnrefused',
      'enotfound',
      'dns',
      'cors',
      'cross-origin',
      'offline',
      'unreachable',
      'http error',
      'httperrorresponse',
      'status: 0',
      'unknown error',
      'err_connection',
      'load failed',
    ];

    return networkIndicators.some((indicator) => errorStr.includes(indicator));
  }

  /**
   * Convert error to string for analysis
   */
  private errorToString(error: unknown): string {
    if (typeof error === 'string') {
      return error;
    }
    if (error instanceof Error) {
      return `${error.name}: ${error.message}`;
    }
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }
}
