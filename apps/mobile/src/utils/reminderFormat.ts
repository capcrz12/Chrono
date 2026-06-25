import { ReminderResponse } from './api';

export function formatReminderTime(datetime: string) {
  return new Date(datetime).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatReminderTimeRange(reminder: ReminderResponse) {
  const start = new Date(reminder.datetime);
  const startStr = formatReminderTime(reminder.datetime);

  if (!reminder.durationMinutes) {
    return startStr;
  }

  const end = new Date(start.getTime() + reminder.durationMinutes * 60000);
  const endStr = end.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${startStr} – ${endStr}`;
}

export function parseInitialDate(iso?: string): Date {
  if (iso) {
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d;
}
