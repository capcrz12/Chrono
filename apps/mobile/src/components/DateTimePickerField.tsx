import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { colors, spacing } from '../theme';

interface DateTimePickerFieldProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
}

function formatDate(d: Date) {
  return d.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(d: Date) {
  return d.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toDatetimeLocalValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function DateTimePickerField({
  label,
  value,
  onChange,
  mode = 'datetime',
}: DateTimePickerFieldProps) {
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const onDateChange = (_: DateTimePickerEvent, date?: Date) => {
    setShowDate(Platform.OS === 'ios');
    if (date) {
      const next = new Date(value);
      next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      onChange(next);
    }
  };

  const onTimeChange = (_: DateTimePickerEvent, date?: Date) => {
    setShowTime(Platform.OS === 'ios');
    if (date) {
      const next = new Date(value);
      next.setHours(date.getHours(), date.getMinutes(), 0, 0);
      onChange(next);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        {/* @ts-expect-error input web */}
        <input
          type="datetime-local"
          value={toDatetimeLocalValue(value)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange(new Date(e.target.value))
          }
          style={{
            width: '100%',
            padding: 14,
            fontSize: 16,
            borderRadius: 10,
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.surface,
            color: colors.text,
            boxSizing: 'border-box',
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {(mode === 'date' || mode === 'datetime') && (
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowDate(true)}
          >
            <Text style={styles.pickerLabel}>Fecha</Text>
            <Text style={styles.pickerValue}>{formatDate(value)}</Text>
          </TouchableOpacity>
        )}
        {(mode === 'time' || mode === 'datetime') && (
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowTime(true)}
          >
            <Text style={styles.pickerLabel}>Hora</Text>
            <Text style={styles.pickerValue}>{formatTime(value)}</Text>
          </TouchableOpacity>
        )}
      </View>

      {showDate && (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          locale="es-ES"
        />
      )}
      {showTime && (
        <DateTimePicker
          value={value}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
          locale="es-ES"
          is24Hour
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pickerButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
  },
  pickerLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  pickerValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
});
