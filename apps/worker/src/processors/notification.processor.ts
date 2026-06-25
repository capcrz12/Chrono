import { SendNotificationJobData } from '@chrono/shared';

export async function sendNotification(data: SendNotificationJobData): Promise<void> {
  console.log('[Worker] Enviando notificación (mock):', {
    userId: data.userId,
    reminderId: data.reminderId,
    title: data.title,
    message: data.message,
  });
}
