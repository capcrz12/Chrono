import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { ReminderResponse } from '../services/api';
import { colors, spacing } from '../theme';

interface ReminderCardProps {
  reminder: ReminderResponse;
  onPress?: () => void;
  onToggleComplete?: () => void;
}

import { formatReminderTimeRange } from '../utils/reminderFormat';

export function ReminderCard({
  reminder,
  onPress,
  onToggleComplete,
}: ReminderCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, reminder.isCompleted && styles.completed]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <TouchableOpacity
        style={[styles.checkbox, reminder.isCompleted && styles.checkboxDone]}
        onPress={onToggleComplete}
      >
        {reminder.isCompleted && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>

      <View style={styles.content}>
        <Text
          style={[styles.title, reminder.isCompleted && styles.titleDone]}
          numberOfLines={1}
        >
          {reminder.title}
        </Text>
        {reminder.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {reminder.description}
          </Text>
        ) : null}
        <Text style={styles.date}>
          {new Date(reminder.datetime).toLocaleDateString('es-ES', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          })}
        </Text>
        <Text style={styles.time}>{formatReminderTimeRange(reminder)}</Text>
        {reminder.recurrence !== 'none' && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{reminder.recurrence}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'flex-start',
  },
  completed: {
    opacity: 0.6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.md,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  time: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
    marginTop: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
  },
  badgeText: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});
