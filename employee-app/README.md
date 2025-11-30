# EmployeeApp

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.1.

## Authentication with Keycloak SSO

This application uses `angular-auth-oidc-client` for OpenID Connect authentication with Keycloak, supporting Single Sign-On (SSO) across multiple applications.

### Why `/sso` is the Redirect URL (Not `/home`)

#### The Problem: Infinite Loop

If you set the OIDC `redirectUrl` to a **guarded route** like `/home`, you'll encounter an infinite redirect loop:

```
User visits /home
    ↓
authGuard checks isAuthenticated$ → NOT authenticated (callback not processed yet)
    ↓
Guard calls oidcService.authorize() → Redirects to Keycloak
    ↓
User authenticates at Keycloak
    ↓
Keycloak redirects back to /home?code=xxx&state=yyy
    ↓
authGuard runs BEFORE callback is processed → Still NOT authenticated!
    ↓
Guard calls authorize() AGAIN → Infinite loop!
```

#### Root Cause

The `authGuard` runs **synchronously** before the OIDC library processes the callback parameters (`code` and `state` from the URL). The guard sees no valid tokens and triggers `authorize()` again.

#### The Solution: Unguarded Callback Route

We use `/sso` as a dedicated **callback handler route** with NO auth guard:

```
Keycloak redirects to /sso?code=xxx&state=yyy
    ↓
/sso has NO guard → Component loads
    ↓
sso.ts calls checkAuthIncludingServer()
    ↓
OIDC library processes callback, validates tokens
    ↓
If authenticated → Navigate to /home
    ↓
/home guard checks → Tokens are now valid → Access granted!
```

#### Route Configuration

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'home',
    canActivate: [authGuard],  // ✅ Protected
    loadComponent: () => import('./home/home').then((m) => m.Home),
  },
  { 
    path: 'sso',               // ❌ NOT protected - callback handler
    loadComponent: () => import('./sso/sso').then((m) => m.Sso) 
  },
  // ...
];
```

#### OIDC Configuration

```json
// oidc.json
{
  "redirectUrl": "https://example.com/#/sso",        // Unguarded callback route
  "postLogoutRedirectUri": "https://example.com/#/sign-out",
  "postLoginRoute": "/home"                          // Where to go after auth
}
```

### Alternative Solutions

#### Option 1: Use `autoLoginPartialRoutesGuard` (from library)

The library provides a guard that handles callback detection:

```typescript
import { autoLoginPartialRoutesGuard } from 'angular-auth-oidc-client';

{
  path: 'home',
  canActivate: [autoLoginPartialRoutesGuard],
  loadComponent: () => import('./home/home').then((m) => m.Home),
}
```

#### Option 2: Use `withAppInitializerAuthCheck()`

Process auth callback in `APP_INITIALIZER` before any route loads:

```typescript
// app.config.ts
provideAuth(authConfig, withAppInitializerAuthCheck())
```

#### Option 3: Detect callback params in custom guard

```typescript
export const authGuard: CanActivateFn = () => {
  const oidcService = inject(OidcSecurityService);
  
  // Check if URL contains callback params
  const hasCallbackParams = window.location.href.includes('code=') 
                         || window.location.href.includes('error=');
  
  if (hasCallbackParams) {
    // Process callback first, then check auth
    return oidcService.checkAuth().pipe(
      map(({ isAuthenticated }) => {
        if (!isAuthenticated) {
          oidcService.authorize();
        }
        return isAuthenticated;
      })
    );
  }
  
  // Normal auth check
  return oidcService.isAuthenticated$.pipe(
    take(1),
    map(({ isAuthenticated }) => {
      if (!isAuthenticated) {
        oidcService.authorize();
      }
      return isAuthenticated;
    })
  );
};
```

### SSO Event Handling

The application handles SSO logout events centrally in `app.ts`:

| Event | Description | Action |
|-------|-------------|--------|
| `CheckSessionReceived` (value: 'changed') | User logged out from another app | `logoffLocal()` + redirect to `/sign-out` |
| `SilentRenewFailed` | Token refresh failed | `logoffLocal()` + redirect to `/sign-out` |
| `TokenExpired` | Access token expired | Library auto-attempts silent renew |

### Logout Methods

| Method | When to Use |
|--------|-------------|
| `logoffAndRevokeTokens()` | User clicks "Logout" in THIS app (triggers SSO logout) |
| `logoffLocal()` | Session already ended at Keycloak (from another app) |

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
