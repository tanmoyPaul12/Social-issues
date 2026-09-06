# Spring Boot Cloud API Gateway

**Port**: `8080`  
**Stack**: Java 21, Spring Boot 3.4.3, Spring Cloud Gateway (Reactive / WebFlux), Netty, Project Reactor, Redis Reactive

---

## 1. Overview & Architecture

The **Cloud API Gateway** is the single entry point for all frontend and client traffic into the platform microservices ecosystem.

```
Frontend (Next.js 16 - Port 3000)
              │
              ▼ (HTTP / SSE)
    API Gateway (Port 8080)
   ├── Unified CORS Filter
   ├── JWT Auth & Header Enrichment (X-User-Id, X-User-Role, etc.)
   ├── Correlation ID Generator & Tracer (X-Correlation-Id)
   ├── Non-blocking SSE Proxy (Buffer-free streaming)
   └── Global Error Envelope Handler
              │
    ┌─────────┼────────────────────────┐
    ▼         ▼                        ▼
Backend   Notification Service      AI Microservice
(Port 8081)  (Port 8082)              (Port 8083)
```

---

## 2. Route Matrix

| Route Pattern | Target Service | Default URL | Purpose |
|---|---|---|---|
| `/api/**` | Core Backend | `http://localhost:8081` | Authentication, Issues, Onboarding, Industry Dashboard, Project Lifecycles |
| `/notifications/**` | Notification Service | `http://localhost:8082` | Real-time SSE event streaming (`/notifications/stream`), user inboxes, direct publishing |
| `/api/notifications/**` | Notification Service | `http://localhost:8082` | Prefixed alias with auto-rewrite to `/notifications/**` |
| `/api/ai/**` | AI Microservice | `http://localhost:8083` | Voice transcription, ticket deduplication, thematic classification |
| `/actuator/**` | API Gateway (Local) | `http://localhost:8080` | Gateway health checks, metrics, and route inspection |

---

## 3. Injected Downstream Headers

When a valid JWT `Bearer <token>` is presented, the Gateway decodes claims and enriches the downstream request with:

- `X-Correlation-Id`: Distributed tracing request identifier.
- `X-User-Id`: Extracted user UUID.
- `X-User-Role`: User RBAC role (e.g. `CITIZEN`, `NODAL_ADMIN`, `HEI_SPOC`, `CSR_ADMIN`).
- `X-User-Name`: Full name of user.
- `X-User-District`: Administrative district/jurisdiction.
- `X-Entity-Type`: `INDIVIDUAL`, `UNIVERSITY`, `INDUSTRY`.
- `X-Gateway-Forwarded`: `true`.

---

## 4. How to Run

### Standalone (Maven Wrapper):
```bash
cd api-gateway
./mvnw clean spring-boot:run
```

### Environment Variables:
| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | Gateway HTTP port |
| `BACKEND_SERVICE_URL` | `http://localhost:8081` | Core Backend service endpoint |
| `NOTIFICATION_SERVICE_URL` | `http://localhost:8082` | Notification service endpoint |
| `AI_SERVICE_URL` | `http://localhost:8083` | AI microservice endpoint |
| `REDIS_HOST` | `localhost` | Redis host for rate limiting |
| `REDIS_PORT` | `6379` | Redis port |
| `JWT_SECRET` | `...` | Shared secret key for JWT validation |
