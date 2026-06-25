import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { RecurrenceType } from '@chrono/shared';

export class CreateReminderDto {
  @ApiProperty({ example: 'Reunión con el equipo' })
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiPropertyOptional({ example: 'Preparar agenda y notas' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-06-25T10:00:00.000Z' })
  @IsDateString()
  datetime!: string;

  @ApiPropertyOptional({ enum: RecurrenceType, default: RecurrenceType.NONE })
  @IsOptional()
  @IsEnum(RecurrenceType)
  recurrence?: RecurrenceType;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}

export class UpdateReminderDto extends PartialType(CreateReminderDto) {}
