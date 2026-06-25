import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { GoogleToken } from './entities/google-token.entity';
import { Reminder } from '../reminders/entities/reminder.entity';

@Injectable()
export class GoogleCalendarService {
  constructor(
    @InjectRepository(GoogleToken)
    private readonly tokensRepository: Repository<GoogleToken>,
    private readonly config: ConfigService,
  ) {}

  async saveTokens(
    userId: string,
    accessToken: string,
    refreshToken: string,
    expiryDate: number,
  ): Promise<GoogleToken> {
    let token = await this.tokensRepository.findOne({ where: { userId } });
    if (token) {
      token.accessToken = accessToken;
      token.refreshToken = refreshToken;
      token.expiryDate = expiryDate;
    } else {
      token = this.tokensRepository.create({
        userId,
        accessToken,
        refreshToken,
        expiryDate,
      });
    }
    return this.tokensRepository.save(token);
  }

  async getTokens(userId: string): Promise<GoogleToken | null> {
    return this.tokensRepository.findOne({ where: { userId } });
  }

  private createOAuthClient() {
    return new google.auth.OAuth2(
      this.config.get<string>('GOOGLE_CLIENT_ID'),
      this.config.get<string>('GOOGLE_CLIENT_SECRET'),
      this.config.get<string>('GOOGLE_CALLBACK_URL'),
    );
  }

  /**
   * Estructura preparada para sync bidireccional.
   * Implementación completa pendiente.
   */
  async syncReminderToGoogle(
    userId: string,
    reminder: Reminder,
  ): Promise<string | null> {
    const tokens = await this.getTokens(userId);
    if (!tokens) {
      console.log(`[GoogleCalendar] Usuario ${userId} sin tokens OAuth`);
      return null;
    }

    const oauth2Client = this.createOAuthClient();
    oauth2Client.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      expiry_date: Number(tokens.expiryDate),
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // TODO: Implementar creación/actualización de eventos
    console.log(
      `[GoogleCalendar] Sync pendiente para recordatorio: ${reminder.title}`,
    );

    return reminder.googleEventId;
  }

  /**
   * Estructura preparada para importar eventos desde Google Calendar.
   */
  async syncFromGoogle(userId: string): Promise<void> {
    const tokens = await this.getTokens(userId);
    if (!tokens) {
      console.log(`[GoogleCalendar] Usuario ${userId} sin tokens para importar`);
      return;
    }

    // TODO: Implementar importación bidireccional
    console.log(`[GoogleCalendar] Importación pendiente para usuario ${userId}`);
  }
}
