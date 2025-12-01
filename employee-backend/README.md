# Employee Backend

Spring WebFlux backend application with OAuth2/OIDC resource server configuration for Keycloak.

## Features

- Spring Boot 4.0 with WebFlux (Reactive)
- OAuth2 Resource Server with JWT validation
- Keycloak integration
- Hairpin NAT support for containerized environments

## Hairpin NAT Workaround for Containers

In Docker/Kubernetes environments, there's a common issue where backend services cannot validate JWT tokens due to network routing problems (hairpin NAT). This occurs because:

1. The JWT token's `iss` (issuer) claim contains the **external/ingress URL**: `https://example.com/auth/realms/universal`
2. The backend service needs to reach Keycloak via the **internal service name**: `http://keycloak:8080/auth/realms/universal`

### Solution

This application implements a custom `ContainerHairpinAddressValidator` that accepts both internal and external issuer URLs.

```
┌─────────────────────────────────────────────────────────────────┐
│  External Client (Browser)                                       │
└─────────────────┬───────────────────────────────────────────────┘
                  │ JWT token with iss: https://example.com/auth/realms/universal
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│  Ingress / Traefik                                               │
│  https://example.com                                             │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│  employee-backend                                                │
│                                                                  │
│  Config:                                                         │
│  - issuer-uri: http://keycloak:8080/auth/realms/universal       │
│  - ingress.urls: https://example.com/auth/realms/universal      │
│                                                                  │
│  ContainerHairpinAddressValidator accepts BOTH:                  │
│  ✓ http://keycloak:8080/auth/realms/universal (internal)        │
│  ✓ https://example.com/auth/realms/universal (external/ingress) │
└─────────────────────────────────────────────────────────────────┘
```

### Configuration

#### Docker Compose

```yaml
employee-backend:
  environment:
    # Internal URL - used to fetch JWKS keys
    spring.security.oauth2.resourceserver.jwt.issuer-uri: http://keycloak:8080/auth/realms/universal
    # External URL(s) - accepted in token's iss claim
    ingress.urls: "https://${SERVER_IP}/auth/realms/universal"
```

#### Kubernetes

```yaml
env:
  - name: spring.security.oauth2.resourceserver.jwt.issuer-uri
    value: "http://keycloak.keycloak-namespace.svc.cluster.local:8080/auth/realms/universal"
  - name: ingress.urls
    value: "https://auth.example.com/auth/realms/universal"
```

### How It Works

| Component | Description |
|-----------|-------------|
| `issuer-uri` | Internal service URL used to fetch JWKS public keys |
| `ingress.urls` | External URL(s) that are accepted in the token's `iss` claim |
| `ContainerHairpinAddressValidator` | Custom validator that accepts both internal & external issuer URLs |
| `ContainerJwtDecoderConfiguration` | Configures the JWT decoder with the custom validator |

### Multiple Ingress URLs

The `ingress.urls` property supports multiple URLs (comma-separated or as an array) for environments with multiple ingress points:

```yaml
ingress.urls: "https://app1.example.com/auth/realms/universal,https://app2.example.com/auth/realms/universal"
```

## Building

```bash
./gradlew build
```

## Running

```bash
./gradlew bootRun
```

## Native Image (GraalVM)

```bash
./gradlew nativeCompile
```
