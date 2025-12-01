# Go Memory Configuration: GOMEMLIMIT and GOGC

## GOMEMLIMIT

**Purpose**: Sets a soft memory limit for the Go runtime (heap + stacks + runtime overhead).

### Recommended Settings

| Container Memory | GOMEMLIMIT | Reasoning |
|-----------------|------------|-----------|
| 128MB | 100MiB | Leave ~28MB for OS/buffers |
| 256MB | 200MiB | ~80% of container |
| 512MB | 400MiB | ~80% of container |
| 1GB | 800MiB | ~80% of container |
| 2GB+ | 1600MiB | ~80% of container |

**Rule of thumb**: Set to **80% of container memory limit**

```bash
# Example
GOMEMLIMIT=400MiB
```

## GOGC (Garbage Collection Target Percentage)

**Purpose**: Controls GC frequency. GC triggers when heap grows by this percentage since last GC.

| Value | Behavior | Use Case |
|-------|----------|----------|
| `100` (default) | GC when heap doubles | Balanced |
| `50` | GC more frequently | Lower memory, higher CPU |
| `200` | GC less frequently | Higher memory, lower CPU |
| `off` | Disable GC target % (use GOMEMLIMIT only) | Memory-constrained containers |

### Recommended Combinations

#### Memory-Constrained Containers (< 512MB)
```bash
GOMEMLIMIT=400MiB
GOGC=50
```
- More aggressive GC to stay within limits
- Trades CPU for lower memory usage

#### Balanced (512MB - 2GB)
```bash
GOMEMLIMIT=800MiB
GOGC=100
```
- Default GOGC with memory cap
- Good for most workloads

#### High-Throughput / Low-Latency (2GB+)
```bash
GOMEMLIMIT=1600MiB
GOGC=200
```
- Less frequent GC
- Lower latency, uses more memory

#### Memory-Capped Only (Recommended for Containers)
```bash
GOMEMLIMIT=400MiB
GOGC=off
```
- GC only when approaching memory limit
- Best throughput within memory budget
- **Recommended for Kubernetes/Docker**

## Docker/Kubernetes Configuration

### Dockerfile
```dockerfile
FROM golang:1.23-alpine AS builder
# ... build steps ...

FROM gcr.io/distroless/static:nonroot
ENV GOMEMLIMIT=400MiB
ENV GOGC=off
COPY --from=builder /app /app
ENTRYPOINT ["/app"]
```

### Kubernetes Deployment
```yaml
containers:
  - name: app
    resources:
      requests:
        memory: "512Mi"
      limits:
        memory: "512Mi"
    env:
      - name: GOMEMLIMIT
        value: "400MiB"  # 80% of 512Mi
      - name: GOGC
        value: "off"
```

### Docker Compose
```yaml
services:
  app:
    image: myapp
    environment:
      GOMEMLIMIT: "400MiB"
      GOGC: "off"
    deploy:
      resources:
        limits:
          memory: 512M
```

## Quick Reference

| Scenario | GOMEMLIMIT | GOGC |
|----------|------------|------|
| **Containerized (recommended)** | 80% of limit | `off` |
| Memory-sensitive | 80% of limit | `50` |
| CPU-sensitive | 70% of limit | `200` |
| Bare metal (no limit) | Not set | `100` |

## Go Fiber App

```compose.yml
GOMEMLIMIT=100MiB
GOGC=off
```

For small static file servers, 128MB container with `GOMEMLIMIT=100MiB` and `GOGC=off` should work well.
