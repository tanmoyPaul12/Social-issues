export type NotificationSeverity = 'INFO' | 'ACTION_REQUIRED' | 'SUCCESS' | 'WARNING';
export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'WHATSAPP';

export interface NotificationPayload {
  eventId: string;
  eventType: string;
  source?: string;
  recipientUserId?: number | string;
  recipientUserType?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  title: string;
  message?: string;
  severity?: NotificationSeverity;
  actionUrl?: string;
  referenceEntityType?: string;
  referenceEntityId?: number | string;
  channels?: string[] | NotificationChannel[];
  statDeltas?: Record<string, any>;
  timestamp?: string;
}

export interface NotificationRecord extends NotificationPayload {
  id: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationJobData {
  payload: NotificationPayload;
  channel: NotificationChannel;
  attempt?: number;
  enqueuedAt: string;
}

export interface ClientConnection {
  id: string;
  userId: string;
  userType?: string;
  connectedAt: Date;
  send: (data: string) => void;
  close: () => void;
}
