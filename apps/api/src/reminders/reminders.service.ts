import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { Reminder } from './entities/reminder.entity';
import { CreateReminderDto, UpdateReminderDto } from './dto/reminder.dto';
import { RecurrenceType, QUEUE_NAMES, JOB_NAMES } from '@chrono/shared';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);
  private readonly queue: Queue | null;

  constructor(
    @InjectRepository(Reminder)
    private readonly remindersRepository: Repository<Reminder>,
    config: ConfigService,
  ) {
    const redisEnabled = config.get<string>('REDIS_ENABLED', 'true') !== 'false';
    this.queue = redisEnabled
      ? new Queue(QUEUE_NAMES.REMINDERS, {
          connection: {
            host: config.get<string>('REDIS_HOST', 'localhost'),
            port: config.get<number>('REDIS_PORT', 6379),
          },
        })
      : null;
  }

  async create(userId: string, dto: CreateReminderDto): Promise<Reminder> {
    const reminder = this.remindersRepository.create({
      userId,
      title: dto.title,
      description: dto.description ?? null,
      datetime: new Date(dto.datetime),
      recurrence: dto.recurrence ?? RecurrenceType.NONE,
      isCompleted: dto.isCompleted ?? false,
    });

    const saved = await this.remindersRepository.save(reminder);
    await this.scheduleReminderJob(saved);
    return saved;
  }

  async findAll(
    userId: string,
    status?: 'pending' | 'completed',
  ): Promise<Reminder[]> {
    const where: FindOptionsWhere<Reminder> = { userId };
    if (status === 'pending') where.isCompleted = false;
    if (status === 'completed') where.isCompleted = true;

    return this.remindersRepository.find({
      where,
      order: { datetime: 'ASC' },
    });
  }

  async findByDateRange(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<Reminder[]> {
    return this.remindersRepository.find({
      where: {
        userId,
        datetime: Between(start, end),
      },
      order: { datetime: 'ASC' },
    });
  }

  async findOne(userId: string, id: string): Promise<Reminder> {
    const reminder = await this.remindersRepository.findOne({
      where: { id, userId },
    });
    if (!reminder) {
      throw new NotFoundException('Recordatorio no encontrado');
    }
    return reminder;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateReminderDto,
  ): Promise<Reminder> {
    const reminder = await this.findOne(userId, id);

    if (dto.title !== undefined) reminder.title = dto.title;
    if (dto.description !== undefined) reminder.description = dto.description ?? null;
    if (dto.datetime !== undefined) reminder.datetime = new Date(dto.datetime);
    if (dto.recurrence !== undefined) reminder.recurrence = dto.recurrence;
    if (dto.isCompleted !== undefined) reminder.isCompleted = dto.isCompleted;

    const saved = await this.remindersRepository.save(reminder);
    await this.scheduleReminderJob(saved);
    return saved;
  }

  async remove(userId: string, id: string): Promise<void> {
    const reminder = await this.findOne(userId, id);
    await this.remindersRepository.remove(reminder);
  }

  private async scheduleReminderJob(reminder: Reminder): Promise<void> {
    if (!this.queue || reminder.isCompleted) return;

    const delay = new Date(reminder.datetime).getTime() - Date.now();
    if (delay <= 0) return;

    try {
      await this.queue.add(
        JOB_NAMES.PROCESS_REMINDER,
        {
          reminderId: reminder.id,
          userId: reminder.userId,
          title: reminder.title,
          datetime: reminder.datetime.toISOString(),
          recurrence: reminder.recurrence,
        },
        {
          delay,
          jobId: `reminder-${reminder.id}`,
          removeOnComplete: true,
        },
      );
    } catch (error) {
      this.logger.warn(
        'Redis no disponible: recordatorio guardado sin cola de notificaciones',
      );
    }
  }
}
