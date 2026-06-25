import { ProcessReminderJobData } from '@chrono/shared';

export async function processReminder(data: ProcessReminderJobData): Promise<void> {
  console.log('[Worker] Procesando recordatorio:', {
    reminderId: data.reminderId,
    userId: data.userId,
    title: data.title,
    datetime: data.datetime,
  });
}
