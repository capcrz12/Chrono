import { ProcessReminderJobData, RecurrenceType } from '@chrono/shared';

function nextOccurrence(datetime: string, recurrence: string): Date | null {
  const current = new Date(datetime);
  if (recurrence === RecurrenceType.DAILY) {
    current.setDate(current.getDate() + 1);
    return current;
  }
  if (recurrence === RecurrenceType.WEEKLY) {
    current.setDate(current.getDate() + 7);
    return current;
  }
  return null;
}

export async function processReminder(
  data: ProcessReminderJobData,
): Promise<{ nextDatetime: string | null }> {
  console.log('[Worker] Procesando recordatorio:', {
    reminderId: data.reminderId,
    userId: data.userId,
    title: data.title,
    datetime: data.datetime,
    recurrence: data.recurrence ?? 'none',
  });

  const next = data.recurrence
    ? nextOccurrence(data.datetime, data.recurrence)
    : null;

  return {
    nextDatetime: next?.toISOString() ?? null,
  };
}
