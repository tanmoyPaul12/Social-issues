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
  severity?: 'INFO' | 'ACTION_REQUIRED' | 'SUCCESS' | 'WARNING';
  actionUrl?: string;
  referenceEntityType?: string;
  referenceEntityId?: number | string;
  channels?: string[];
  statDeltas?: Record<string, any>;
  timestamp?: string;
}

export interface ClientConnection {
  id: string;
  userId: string;
  userType?: string;
  connectedAt: Date;
  send: (data: string) => void;
  close: () => void;
}
