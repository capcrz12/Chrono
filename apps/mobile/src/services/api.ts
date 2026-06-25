import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { CustomRecurrence } from '@chrono/shared';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';
const TOKEN_KEY = 'chrono_token';

const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

class ApiClient {
  private token: string | null = null;

  async init() {
    this.token = await storage.getItem(TOKEN_KEY);
  }

  async setToken(token: string | null) {
    this.token = token;
    if (token) {
      await storage.setItem(TOKEN_KEY, token);
    } else {
      await storage.removeItem(TOKEN_KEY);
    }
  }

  async getToken() {
    if (!this.token) {
      this.token = await storage.getItem(TOKEN_KEY);
    }
    return this.token;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = await this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Error de red',
      }));
      throw new Error(
        Array.isArray(error.message) ? error.message[0] : error.message,
      );
    }

    return response.json();
  }

  register(email: string, name: string, password: string) {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, name, password }),
    });
  }

  login(email: string, password: string) {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  me() {
    return this.request<{ id: string; email: string; name: string }>('/auth/me');
  }

  getReminders(status?: 'pending' | 'completed', start?: string, end?: string) {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (start) params.set('start', start);
    if (end) params.set('end', end);
    const query = params.toString() ? `?${params}` : '';
    return this.request<ReminderResponse[]>(`/reminders${query}`);
  }

  getReminder(id: string) {
    return this.request<ReminderResponse>(`/reminders/${id}`);
  }

  createReminder(data: CreateReminderPayload) {
    return this.request<ReminderResponse>('/reminders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateReminder(id: string, data: Partial<CreateReminderPayload>) {
    return this.request<ReminderResponse>(`/reminders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  deleteReminder(id: string) {
    return this.request<{ message: string }>(`/reminders/${id}`, {
      method: 'DELETE',
    });
  }

  getGoogleAuthUrl(platform: 'web' | 'mobile' = 'mobile') {
    return this.request<{ url: string }>(
      `/auth/google/url?platform=${platform}`,
    );
  }

  registerPushToken(token: string) {
    return this.request<{ message: string }>('/users/push-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  updateNotificationPrefs(emailNotificationsEnabled: boolean) {
    return this.request<{ emailNotificationsEnabled: boolean }>(
      '/users/notification-preferences',
      {
        method: 'PATCH',
        body: JSON.stringify({ emailNotificationsEnabled }),
      },
    );
  }

  googleCalendarStatus() {
    return this.request<{ connected: boolean; message: string }>(
      '/google-calendar/status',
    );
  }
}

export interface ReminderResponse {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  datetime: string;
  durationMinutes: number | null;
  recurrence: string;
  customRecurrence: CustomRecurrence | null;
  isCompleted: boolean;
  googleEventId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReminderPayload {
  title: string;
  description?: string;
  datetime: string;
  durationMinutes?: number | null;
  recurrence?: string;
  customRecurrence?: CustomRecurrence | null;
  isCompleted?: boolean;
}

export const api = new ApiClient();
