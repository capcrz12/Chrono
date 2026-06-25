import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CustomRecurrence, RecurrenceUnit } from '@chrono/shared';
import { colors, spacing } from '../theme';

const UNITS: { value: RecurrenceUnit; label: string }[] = [
  { value: 'days', label: 'Días' },
  { value: 'weeks', label: 'Semanas' },
  { value: 'months', label: 'Meses' },
];

const WEEKDAYS = [
  { value: 1, label: 'L' },
  { value: 2, label: 'M' },
  { value: 3, label: 'X' },
  { value: 4, label: 'J' },
  { value: 5, label: 'V' },
  { value: 6, label: 'S' },
  { value: 0, label: 'D' },
];

interface CustomRecurrencePickerProps {
  value: CustomRecurrence;
  onChange: (value: CustomRecurrence) => void;
}

export function CustomRecurrencePicker({
  value,
  onChange,
}: CustomRecurrencePickerProps) {
  const toggleDay = (day: number) => {
    const days = value.daysOfWeek ?? [];
    const next = days.includes(day)
      ? days.filter((d) => d !== day)
      : [...days, day];
    onChange({ ...value, daysOfWeek: next.length ? next : undefined });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Repetir cada</Text>
      <View style={styles.intervalRow}>
        <TouchableOpacity
          style={styles.stepper}
          onPress={() =>
            onChange({
              ...value,
              interval: Math.max(1, value.interval - 1),
            })
          }
        >
          <Text style={styles.stepperText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.intervalValue}>{value.interval}</Text>
        <TouchableOpacity
          style={styles.stepper}
          onPress={() =>
            onChange({ ...value, interval: Math.min(365, value.interval + 1) })
          }
        >
          <Text style={styles.stepperText}>+</Text>
        </TouchableOpacity>
        <View style={styles.units}>
          {UNITS.map((unit) => (
            <TouchableOpacity
              key={unit.value}
              style={[
                styles.unitChip,
                value.unit === unit.value && styles.unitChipActive,
              ]}
              onPress={() => onChange({ ...value, unit: unit.value })}
            >
              <Text
                style={[
                  styles.unitText,
                  value.unit === unit.value && styles.unitTextActive,
                ]}
              >
                {unit.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={styles.subtitle}>O en días concretos</Text>
      <View style={styles.weekRow}>
        {WEEKDAYS.map((day) => {
          const active = value.daysOfWeek?.includes(day.value);
          return (
            <TouchableOpacity
              key={day.value}
              style={[styles.dayChip, active && styles.dayChipActive]}
              onPress={() => toggleDay(day.value)}
            >
              <Text
                style={[styles.dayText, active && styles.dayTextActive]}
              >
                {day.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  intervalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  stepper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepperText: {
    fontSize: 20,
    color: colors.text,
  },
  intervalValue: {
    fontSize: 20,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'center',
    color: colors.text,
  },
  units: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
    flexWrap: 'wrap',
  },
  unitChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unitChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unitText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  unitTextActive: {
    color: '#FFF',
  },
  weekRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dayChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dayTextActive: {
    color: '#FFF',
  },
});
