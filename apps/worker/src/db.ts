import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface UserNotificationInfo {
  email: string;
  expoPushToken: string | null;
  emailNotificationsEnabled: boolean;
}

export async function getUserNotificationInfo(
  userId: string,
): Promise<UserNotificationInfo | null> {
  const result = await pool.query<{
    email: string;
    expoPushToken: string | null;
    emailNotificationsEnabled: boolean;
  }>(
    `SELECT email, "expoPushToken", "emailNotificationsEnabled" FROM users WHERE id = $1`,
    [userId],
  );
  return result.rows[0] ?? null;
}
