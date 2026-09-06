import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import { redisSubscriber } from './redisSubscriber.js';
import { sseManager } from './sseManager.js';
import { NotificationPayload } from './types.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8082;
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// 1. Health & Diagnostics Check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'UP',
    service: 'notification-service',
    timestamp: new Date().toISOString(),
    redis: redisSubscriber.getStatus(),
    activeSseConnections: sseManager.getActiveCount()
  });
});

// 2. Real-Time Server-Sent Events (SSE) Stream
// GET /notifications/stream?userId=123
app.get('/notifications/stream', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || (req.query.token ? '1' : 'anonymous');
  const clientId = `client_${randomUUID().substring(0, 8)}`;

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Prevent Nginx buffering
  res.flushHeaders();

  sseManager.registerClient(clientId, userId, res);

  req.on('close', () => {
    sseManager.removeClient(clientId);
  });
});

// 3. User Notification Inbox / History
app.get('/notifications/inbox', (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  const history = sseManager.getRecentHistory(userId);
  res.json({
    count: history.length,
    notifications: history
  });
});

// 4. Direct HTTP Event Dispatcher (Fallback or Direct Ingestion)
app.post('/notifications/publish', (req: Request, res: Response) => {
  const payload: NotificationPayload = {
    eventId: req.body.eventId || `evt_${randomUUID().substring(0, 8)}`,
    eventType: req.body.eventType || 'GENERAL_ALERT',
    title: req.body.title || 'Platform Notification',
    message: req.body.message || '',
    recipientUserId: req.body.recipientUserId,
    severity: req.body.severity || 'INFO',
    actionUrl: req.body.actionUrl,
    channels: req.body.channels || ['IN_APP'],
    statDeltas: req.body.statDeltas || {},
    timestamp: new Date().toISOString()
  };

  sseManager.dispatchNotification(payload);

  res.status(202).json({
    success: true,
    message: 'Notification published to active subscribers',
    eventId: payload.eventId
  });
});

// Start Server & Connect to Redis
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Independent Notification Microservice started on port ${PORT}`);
  console.log(`📡 SSE Stream: http://localhost:${PORT}/notifications/stream`);
  console.log(`💓 Health:     http://localhost:${PORT}/health`);
  console.log(`=======================================================`);

  redisSubscriber.init(REDIS_HOST, REDIS_PORT);
});
