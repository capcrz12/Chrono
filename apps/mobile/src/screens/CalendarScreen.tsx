import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api, ReminderResponse } from '../services/api';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { formatReminderTimeRange } from '../utils/reminderFormat';

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

  const dayReminders = reminders
    .filter((r) => r.datetime.split('T')[0] === selectedDate)
    .sort(
      (a, b) =>
        new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
    );

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const openCreateForDay = (dateKey?: string) => {
    const date = dateKey ?? selectedDate;
    const d = new Date(date);
    d.setHours(9, 0, 0, 0);
    navigation.navigate('ReminderForm', { initialDate: d.toISOString() });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendario</Text>

      <Calendar
        onDayPress={onDayPress}
        onDayLongPress={(day) => openCreateForDay(day.dateString)}
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

      <View style={styles.dayHeader}>
        <Text style={styles.dayTitle}>
          {new Date(selectedDate).toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => openCreateForDay()}
        >
          <Text style={styles.addButtonText}>+ Añadir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.agenda} contentContainerStyle={styles.agendaContent}>
        {dayReminders.length === 0 ? (
          <TouchableOpacity
            style={styles.emptySlot}
            onPress={() => openCreateForDay()}
          >
            <Text style={styles.emptyText}>Sin recordatorios</Text>
            <Text style={styles.emptyHint}>Toca para crear uno a las 9:00</Text>
          </TouchableOpacity>
        ) : (
          dayReminders.map((reminder) => (
            <TouchableOpacity
              key={reminder.id}
              style={[
                styles.agendaItem,
                reminder.isCompleted && styles.agendaItemDone,
              ]}
              onPress={() =>
                navigation.navigate('ReminderForm', {
                  reminderId: reminder.id,
                })
              }
            >
              <Text style={styles.agendaTime}>
                {formatReminderTimeRange(reminder)}
              </Text>
              <View style={styles.agendaBody}>
                <Text
                  style={[
                    styles.agendaTitle,
                    reminder.isCompleted && styles.agendaTitleDone,
                  ]}
                  numberOfLines={1}
                >
                  {reminder.title}
                </Text>
                {reminder.description ? (
                  <Text style={styles.agendaDesc} numberOfLines={1}>
                    {reminder.description}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: {
    ...typography.title,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  calendar: {
    marginHorizontal: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  dayTitle: {
    ...typography.heading,
    fontSize: 16,
    flex: 1,
    textTransform: 'capitalize',
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  agenda: { flex: 1 },
  agendaContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  agendaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  agendaItemDone: { opacity: 0.5 },
  agendaTime: {
    width: 100,
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
    fontVariant: ['tabular-nums'],
  },
  agendaBody: { flex: 1 },
  agendaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  agendaTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  agendaDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptySlot: {
    padding: spacing.xl,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginTop: spacing.sm,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  emptyHint: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
});
