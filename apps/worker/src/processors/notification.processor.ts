import nodemailer from 'nodemailer';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { SendNotificationJobData } from '@chrono/shared';
import { getUserNotificationInfo } from '../db';

const expo = new Expo();

function createMailer() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendPush(token: string, title: string, body: string) {
  if (!Expo.isExpoPushToken(token)) {
    console.warn('[Worker] Token push inválido:', token);
    return;
  }

  const message: ExpoPushMessage = {
    to: token,
    sound: 'default',
    title,
    body,
    data: { type: 'reminder' },
  };

  const chunks = expo.chunkPushNotifications([message]);
  for (const chunk of chunks) {
    const tickets = await expo.sendPushNotificationsAsync(chunk);
    console.log('[Worker] Push enviado:', tickets);
  }
}

async function sendEmail(to: string, subject: string, text: string) {
  const transporter = createMailer();
  if (!transporter) {
    console.log('[Worker] Email (SMTP no configurado):', { to, subject, text });
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? 'chrono@localhost',
    to,
    subject,
    text,
    html: `<p>${text}</p>`,
  });
  console.log('[Worker] Email enviado a:', to);
}

export async function sendNotification(
  data: SendNotificationJobData,
): Promise<void> {
  const user =
    data.userEmail !== undefined
      ? {
          email: data.userEmail,
          expoPushToken: data.expoPushToken ?? null,
          emailNotificationsEnabled: true,
        }
      : await getUserNotificationInfo(data.userId);

  if (!user) {
    console.warn('[Worker] Usuario no encontrado:', data.userId);
    return;
  }

  const title = data.title;
  const message = data.message;

  const wantsEmail =
    user.emailNotificationsEnabled &&
    (data.channel === 'email' || data.channel === 'both');
  const wantsPush =
    user.expoPushToken &&
    (data.channel === 'push' || data.channel === 'both');

  if (wantsPush && user.expoPushToken) {
    try {
      await sendPush(user.expoPushToken, title, message);
    } catch (err) {
      console.error('[Worker] Error enviando push:', err);
    }
  }

  if (wantsEmail) {
    try {
      await sendEmail(user.email, `Chrono: ${title}`, message);
    } catch (err) {
      console.error('[Worker] Error enviando email:', err);
    }
  }

  if (!wantsPush && !wantsEmail) {
    console.log('[Worker] Notificación (sin canal activo):', {
      userId: data.userId,
      title,
      message,
    });
  }
}
