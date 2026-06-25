import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
  { value: 'completed', label: 'Hechos' },
];

export function FilterChips({ value, onChange, counts }: FilterChipsProps) {
  return (
    <View style={styles.row}>
      {OPTIONS.map((option) => {
        const active = value === option.value;
        const count = counts?.[option.value];

        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onChange(option.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {option.label}
              {count !== undefined ? ` · ${count}` : ''}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
});
