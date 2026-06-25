import 'dotenv/config';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../../.env') });
import { Worker, Queue, Job } from 'bullmq';
import {
  QUEUE_NAMES,
  JOB_NAMES,
  ProcessReminderJobData,
  SendNotificationJobData,
} from '@chrono/shared';
import { processReminder } from './processors/reminder.processor';
import { sendNotification } from './processors/notification.processor';

const redisConnection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? 6379),
};

const notificationQueue = new Queue(QUEUE_NAMES.REMINDERS, {
  connection: redisConnection,
});

type ReminderJobData = ProcessReminderJobData | SendNotificationJobData;

const reminderWorker = new Worker<ReminderJobData>(
  QUEUE_NAMES.REMINDERS,
  async (job: Job<ReminderJobData>) => {
    if (job.name === JOB_NAMES.PROCESS_REMINDER) {
      const data = job.data as ProcessReminderJobData;
      await processReminder(data);

      await notificationQueue.add(
        JOB_NAMES.SEND_NOTIFICATION,
        {
          userId: data.userId,
          reminderId: data.reminderId,
          title: data.title,
          message: `Recordatorio: ${data.title}`,
        },
        { removeOnComplete: true },
      );
    }

    if (job.name === JOB_NAMES.SEND_NOTIFICATION) {
      await sendNotification(job.data as SendNotificationJobData);
    }
  },
  { connection: redisConnection },
);

reminderWorker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} (${job.name}) completado`);
});

reminderWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} falló:`, err.message);
});

console.log('[Worker] Chrono worker iniciado, escuchando cola:', QUEUE_NAMES.REMINDERS);

process.on('SIGTERM', async () => {
  await reminderWorker.close();
  process.exit(0);
});
