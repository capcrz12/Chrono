import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GoogleCalendarService } from './google-calendar.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('google-calendar')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('google-calendar')
export class GoogleCalendarController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}

  @Get('status')
  @ApiOperation({ summary: 'Estado de conexión con Google Calendar' })
  async status(@CurrentUser() user: User) {
    const tokens = await this.googleCalendarService.getTokens(user.id);
    return {
      connected: !!tokens,
      message: tokens
        ? 'Google Calendar conectado'
        : 'Google Calendar no conectado. Usa OAuth para vincular.',
    };
  }

  @Post('sync')
  @ApiOperation({ summary: 'Sincronizar recordatorios con Google Calendar (stub)' })
  async sync(@CurrentUser() user: User) {
    await this.googleCalendarService.syncFromGoogle(user.id);
    return {
      message: 'Sincronización iniciada (implementación pendiente)',
      status: 'pending',
    };
  }
}
