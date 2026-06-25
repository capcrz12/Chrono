import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { GoogleCalendarService } from '../../google-calendar/google-calendar.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
    private readonly googleCalendarService: GoogleCalendarService,
  ) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID') ?? 'not-configured',
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET') ?? 'not-configured',
      callbackURL: config.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile', 'https://www.googleapis.com/auth/calendar'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: { id: string; emails?: { value: string }[]; displayName?: string },
    done: VerifyCallback,
  ): Promise<void> {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      return done(new Error('No se pudo obtener el email de Google'), undefined);
    }

    let user = await this.usersService.findByGoogleId(profile.id);
    if (!user) {
      user = await this.usersService.findByEmail(email);
      if (user) {
        user = await this.usersService.update(user.id, { googleId: profile.id });
      } else {
        user = await this.usersService.create({
          email,
          name: profile.displayName ?? email.split('@')[0],
          googleId: profile.id,
        });
      }
    }

    if (accessToken && refreshToken) {
      await this.googleCalendarService.saveTokens(
        user.id,
        accessToken,
        refreshToken,
        Date.now() + 3600 * 1000,
      );
    }

    done(null, user);
  }
}
