# Standalone Event-Driven Notification Microservice

Independent, high-performance Node.js / TypeScript microservice for real-time notifications on the Jharkhand Innovation Platform.

## Architecture
- Listens to Redis channels (`events:industry:notifications`, `events:citizen:notifications`, `events:general:notifications`).
- Maintains persistent **Server-Sent Events (SSE)** connections with active user dashboards in Next.js.
- Dispatches instant toasts, badge increments, and activity updates without polling.

## Quick Start

```bash
cd notification-service
npm install
npm run dev
```

The service will start on `http://localhost:8082`.

## Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Service status, Redis connectivity, and active SSE client count |
| `GET` | `/notifications/stream?userId=123` | Real-time Server-Sent Events stream |
| `GET` | `/notifications/inbox?userId=123` | Recent notification history |
| `POST` | `/notifications/publish` | Direct JSON notification dispatcher |
