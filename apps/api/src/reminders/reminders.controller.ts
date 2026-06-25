import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { RemindersService } from './reminders.service';
import { CreateReminderDto, UpdateReminderDto } from './dto/reminder.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('reminders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear recordatorio' })
  create(@CurrentUser() user: User, @Body() dto: CreateReminderDto) {
    return this.remindersService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar recordatorios del usuario' })
  @ApiQuery({ name: 'start', required: false, description: 'Fecha inicio ISO' })
  @ApiQuery({ name: 'end', required: false, description: 'Fecha fin ISO' })
  findAll(
    @CurrentUser() user: User,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    if (start && end) {
      return this.remindersService.findByDateRange(
        user.id,
        new Date(start),
        new Date(end),
      );
    }
    return this.remindersService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener recordatorio por ID' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.remindersService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar recordatorio' })
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateReminderDto,
  ) {
    return this.remindersService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar recordatorio' })
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    await this.remindersService.remove(user.id, id);
    return { message: 'Recordatorio eliminado' };
  }
}
