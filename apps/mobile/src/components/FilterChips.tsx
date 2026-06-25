import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors, spacing } from '../theme';

export type FilterValue = 'all' | 'pending' | 'completed';

interface FilterChipsProps {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  counts?: { all: number; pending: number; completed: number };
}

const OPTIONS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'completed', label: 'Completados' },
];

export function FilterChips({ value, onChange, counts }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {OPTIONS.map((option) => {
        const active = value === option.value;
        const count = counts?.[option.value];
        const label =
          count !== undefined ? `${option.label} (${count})` : option.label;

        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onChange(option.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
});
