import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing } from '../theme';

const PRESETS = [
  { label: 'Sin duración', value: null },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 h', value: 60 },
  { label: '1,5 h', value: 90 },
  { label: '2 h', value: 120 },
];

interface DurationPickerProps {
  value: number | null;
  onChange: (minutes: number | null) => void;
}

export function DurationPicker({ value, onChange }: DurationPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Duración (opcional)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {PRESETS.map((preset) => {
            const active = value === preset.value;
            return (
              <TouchableOpacity
                key={preset.label}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => onChange(preset.value)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {preset.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
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
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFF',
  },
});
