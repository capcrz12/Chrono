import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { RemindersModule } from './reminders/reminders.module';
import { GoogleCalendarModule } from './google-calendar/google-calendar.module';
import { HealthModule } from './health/health.module';
import { User } from './users/entities/user.entity';
import { Reminder } from './reminders/entities/reminder.entity';
import { GoogleToken } from './google-calendar/entities/google-token.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [User, Reminder, GoogleToken],
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
    }),
    AuthModule,
    RemindersModule,
    GoogleCalendarModule,
    HealthModule,
  ],
})
export class AppModule {}
