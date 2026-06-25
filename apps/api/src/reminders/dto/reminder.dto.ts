import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsInt,
  Min,
  Max,
  MinLength,
  ValidateNested,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { RecurrenceType, RecurrenceUnit } from '@chrono/shared';

export class CustomRecurrenceDto {
  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  @Max(365)
  interval!: number;

  @ApiProperty({ enum: ['days', 'weeks', 'months'] })
  @IsEnum(['days', 'weeks', 'months'])
  unit!: RecurrenceUnit;

  @ApiPropertyOptional({
    example: [1, 3, 5],
    description: 'Días de la semana (0=domingo)',
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(7)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  daysOfWeek?: number[];
}

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

  @ApiPropertyOptional({ example: 60, description: 'Duración en minutos' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(24 * 60)
  durationMinutes?: number | null;

  @ApiPropertyOptional({ enum: RecurrenceType, default: RecurrenceType.NONE })
  @IsOptional()
  @IsEnum(RecurrenceType)
  recurrence?: RecurrenceType;

  @ApiPropertyOptional({ type: CustomRecurrenceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CustomRecurrenceDto)
  customRecurrence?: CustomRecurrenceDto | null;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}

export class UpdateReminderDto extends PartialType(CreateReminderDto) {}
