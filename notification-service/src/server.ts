import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import { redisSubscriber } from './redisSubscriber.js';
import { sseManager } from './sseManager.js';
import { queueManager } from './queue/queueManager.js';
import { inAppWorker } from './workers/inAppWorker.js';
import { emailWorker } from './workers/emailWorker.js';
import { smsWorker } from './workers/smsWorker.js';
import { escalationScheduler } from './scheduler/escalationJob.js';
import { notificationStore } from './storage/notificationStore.js';
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
    queue: queueManager.getStatus(),
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

// 3. User Notification Persistent Inbox (Paginated)
// GET /notifications/inbox?userId=123&page=1&size=20
app.get('/notifications/inbox', async (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'all';
  const page = parseInt((req.query.page as string) || '1', 10);
  const size = parseInt((req.query.size as string) || '20', 10);

  try {
    const result = await notificationStore.getInbox(userId, page, size);
    res.json({
      success: true,
      userId,
      page,
      size,
      total: result.total,
      unreadCount: result.unreadCount,
      notifications: result.notifications
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Mark a Single Notification as Read
// POST /notifications/:id/read?userId=123
app.post('/notifications/:id/read', async (req: Request, res: Response) => {
  const eventId = req.params.id;
  const userId = (req.query.userId as string) || (req.body.userId as string) || 'all';

  try {
    await notificationStore.markAsRead(userId, eventId);
    const unreadCount = await notificationStore.getUnreadCount(userId);
    res.json({
      success: true,
      eventId,
      userId,
      unreadCount
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Mark All Notifications as Read for User
// POST /notifications/mark-all-read?userId=123
app.post('/notifications/mark-all-read', async (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || (req.body.userId as string) || 'all';

  try {
    const markedCount = await notificationStore.markAllAsRead(userId);
    res.json({
      success: true,
      userId,
      markedCount,
      unreadCount: 0
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Get Unread Count for Notification Badge
// GET /notifications/unread-count?userId=123
app.get('/notifications/unread-count', async (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'all';

  try {
    const count = await notificationStore.getUnreadCount(userId);
    res.json({
      success: true,
      userId,
      unreadCount: count
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Decoupled HTTP Event Ingestion -> Enqueues to BullMQ
// POST /notifications/publish
app.post('/notifications/publish', async (req: Request, res: Response) => {
  const payload: NotificationPayload = {
    eventId: req.body.eventId || `evt_${randomUUID().substring(0, 8)}`,
    eventType: req.body.eventType || 'GENERAL_ALERT',
    source: req.body.source || 'HTTP_API',
    title: req.body.title || 'Platform Notification',
    message: req.body.message || '',
    recipientUserId: req.body.recipientUserId,
    recipientUserType: req.body.recipientUserType,
    recipientEmail: req.body.recipientEmail,
    recipientPhone: req.body.recipientPhone,
    severity: req.body.severity || 'INFO',
    actionUrl: req.body.actionUrl,
    channels: req.body.channels || ['IN_APP'],
    statDeltas: req.body.statDeltas || {},
    timestamp: new Date().toISOString()
  };

  try {
    // Decoupled ingestion into BullMQ Queue
    await queueManager.enqueueNotification(payload);

    res.status(202).json({
      success: true,
      message: 'Notification enqueued for asynchronous multi-channel dispatch',
      eventId: payload.eventId
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Manual Trigger for SLA Escalation Check
// POST /notifications/trigger-sla-check
app.post('/notifications/trigger-sla-check', async (req: Request, res: Response) => {
  try {
    const count = await escalationScheduler.checkAndTriggerEscalations();
    res.json({
      success: true,
      message: 'SLA Escalation audit executed',
      remindersFired: count
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server & Initialize Pipeline
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Production Notification Microservice started on port ${PORT}`);
  console.log(`📡 SSE Stream:   http://localhost:${PORT}/notifications/stream`);
  console.log(`📬 Inbox API:    http://localhost:${PORT}/notifications/inbox`);
  console.log(`💓 Health:       http://localhost:${PORT}/health`);
  console.log(`=======================================================`);

  // 1. Connect Redis Subscriber
  const redisInstance = redisSubscriber.init(REDIS_HOST, REDIS_PORT);

  // 2. Initialize Redis-backed Notification Store
  notificationStore.init(redisInstance);

  // 3. Initialize BullMQ Queue
  queueManager.init(REDIS_HOST, REDIS_PORT);

  // 4. Start Channel Workers
  inAppWorker.init(REDIS_HOST, REDIS_PORT);
  emailWorker.init(REDIS_HOST, REDIS_PORT);
  smsWorker.init(REDIS_HOST, REDIS_PORT);

  // 5. Start SLA Escalation Scheduler
  escalationScheduler.init();
});
