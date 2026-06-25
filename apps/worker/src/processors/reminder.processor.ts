import {
  ProcessReminderJobData,
  RecurrenceType,
  CustomRecurrence,
} from '@chrono/shared';

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function nextCustomOccurrence(
  datetime: string,
  custom: CustomRecurrence,
): Date | null {
  const current = new Date(datetime);

  if (custom.daysOfWeek?.length) {
    for (let i = 1; i <= 366; i++) {
      const candidate = addDays(current, i);
      if (custom.daysOfWeek.includes(candidate.getDay())) {
        return candidate;
      }
    }
    return null;
  }

  switch (custom.unit) {
    case 'days':
      return addDays(current, custom.interval);
    case 'weeks':
      return addWeeks(current, custom.interval);
    case 'months':
      return addMonths(current, custom.interval);
    default:
      return null;
  }
}

function nextOccurrence(
  datetime: string,
  recurrence: string,
  customRecurrence?: CustomRecurrence | null,
): Date | null {
  const current = new Date(datetime);

  if (recurrence === RecurrenceType.DAILY) {
    return addDays(current, 1);
  }
  if (recurrence === RecurrenceType.WEEKLY) {
    return addWeeks(current, 1);
  }
  if (recurrence === RecurrenceType.CUSTOM && customRecurrence) {
    return nextCustomOccurrence(datetime, customRecurrence);
  }
  return null;
}

export async function processReminder(
  data: ProcessReminderJobData,
): Promise<{ nextDatetime: string | null }> {
  console.log('[Worker] Procesando recordatorio:', {
    reminderId: data.reminderId,
    title: data.title,
    datetime: data.datetime,
    recurrence: data.recurrence ?? 'none',
  });

  const next = data.recurrence
    ? nextOccurrence(data.datetime, data.recurrence, data.customRecurrence)
    : null;

  return { nextDatetime: next?.toISOString() ?? null };
}
