import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api, ReminderResponse } from '../services/api';
import { ReminderCard } from '../components/ReminderCard';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function CalendarScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [reminders, setReminders] = useState<ReminderResponse[]>([]);
  const [markedDates, setMarkedDates] = useState<Record<string, object>>({});

  const loadMonthReminders = async () => {
    const start = new Date(selectedDate);
    start.setDate(1);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    try {
      const data = await api.getReminders(
        undefined,
        start.toISOString(),
        end.toISOString(),
      );
      setReminders(data);

      const marks: Record<string, object> = {};
      data.forEach((r) => {
        const dateKey = r.datetime.split('T')[0];
        marks[dateKey] = {
          marked: true,
          dotColor: r.isCompleted ? colors.textMuted : colors.accent,
        };
      });
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: colors.primary,
      };
      setMarkedDates(marks);
    } catch (err) {
      console.error('Error cargando calendario:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMonthReminders();
    }, [selectedDate]),
  );

  const dayReminders = reminders.filter(
    (r) => r.datetime.split('T')[0] === selectedDate,
  );

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendario</Text>

      <Calendar
        onDayPress={onDayPress}
        markedDates={markedDates}
        theme={{
          backgroundColor: colors.background,
          calendarBackground: colors.surface,
          textSectionTitleColor: colors.textSecondary,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: '#FFFFFF',
          todayTextColor: colors.accent,
          dayTextColor: colors.text,
          textDisabledColor: colors.textMuted,
          dotColor: colors.accent,
          monthTextColor: colors.text,
          arrowColor: colors.text,
        }}
        style={styles.calendar}
      />

      <ScrollView style={styles.daySection} contentContainerStyle={styles.dayContent}>
        <Text style={styles.dayTitle}>
          {new Date(selectedDate).toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </Text>

        {dayReminders.length === 0 ? (
          <Text style={styles.empty}>No hay recordatorios este día</Text>
        ) : (
          dayReminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              onPress={() =>
                navigation.navigate('ReminderForm', { reminderId: reminder.id })
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.title,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  calendar: {
    marginHorizontal: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  daySection: {
    flex: 1,
  },
  dayContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  dayTitle: {
    ...typography.heading,
    fontSize: 17,
    marginBottom: spacing.md,
    textTransform: 'capitalize',
  },
  empty: {
    ...typography.caption,
    textAlign: 'center',
    paddingTop: spacing.lg,
  },
});
