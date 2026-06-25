export enum RecurrenceType {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  CUSTOM = 'custom',
}

export type RecurrenceUnit = 'days' | 'weeks' | 'months';

export interface CustomRecurrence {
  interval: number;
  unit: RecurrenceUnit;
  /** 0=domingo … 6=sábado */
  daysOfWeek?: number[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  expoPushToken?: string | null;
  emailNotificationsEnabled?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  datetime: Date;
  durationMinutes: number | null;
  recurrence: RecurrenceType;
  customRecurrence: CustomRecurrence | null;
  isCompleted: boolean;
  googleEventId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoogleTokens {
  accessToken: string;
  refreshToken: string;
  expiryDate: number;
}

export interface AuthResponse {
  accessToken: string;
  user: Pick<User, 'id' | 'email' | 'name'>;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export const QUEUE_NAMES = {
  REMINDERS: 'reminders',
} as const;

export const JOB_NAMES = {
  PROCESS_REMINDER: 'process-reminder',
  SEND_NOTIFICATION: 'send-notification',
} as const;

export interface ProcessReminderJobData {
  reminderId: string;
  userId: string;
  title: string;
  datetime: string;
  recurrence?: string;
  customRecurrence?: CustomRecurrence | null;
}

export interface SendNotificationJobData {
  userId: string;
  reminderId: string;
  title: string;
  message: string;
  userEmail?: string;
  expoPushToken?: string | null;
  channel: 'push' | 'email' | 'both';
}

export const DURATION_PRESETS = [0, 15, 30, 45, 60, 90, 120] as const;
