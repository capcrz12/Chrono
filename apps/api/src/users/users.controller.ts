import { Controller, Post, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import {
  RegisterPushTokenDto,
  UpdateNotificationPrefsDto,
} from './dto/user.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('push-token')
  @ApiOperation({ summary: 'Registrar token Expo Push para notificaciones' })
  async registerPushToken(
    @CurrentUser() user: User,
    @Body() dto: RegisterPushTokenDto,
  ) {
    await this.usersService.update(user.id, { expoPushToken: dto.token });
    return { message: 'Token registrado' };
  }

  @Patch('notification-preferences')
  @ApiOperation({ summary: 'Actualizar preferencias de notificación' })
  async updateNotificationPrefs(
    @CurrentUser() user: User,
    @Body() dto: UpdateNotificationPrefsDto,
  ) {
    const updated = await this.usersService.update(user.id, {
      emailNotificationsEnabled: dto.emailNotificationsEnabled,
    });
    return {
      emailNotificationsEnabled: updated.emailNotificationsEnabled,
    };
  }
}
