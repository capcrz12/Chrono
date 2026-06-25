import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api, ReminderResponse } from '../services/api';
import { ReminderCard } from '../components/ReminderCard';
import { FilterChips, FilterValue } from '../components/FilterChips';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function RemindersListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [reminders, setReminders] = useState<ReminderResponse[]>([]);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReminders = async () => {
    try {
      const data = await api.getReminders();
      setReminders(data);
    } catch (err) {
      console.error('Error cargando recordatorios:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadReminders();
    }, []),
  );

  const counts = useMemo(() => {
    const pending = reminders.filter((r) => !r.isCompleted).length;
    const completed = reminders.filter((r) => r.isCompleted).length;
    return {
      all: reminders.length,
      pending,
      completed,
    };
  }, [reminders]);

  const filteredReminders = useMemo(() => {
    if (filter === 'pending') return reminders.filter((r) => !r.isCompleted);
    if (filter === 'completed') return reminders.filter((r) => r.isCompleted);
    return reminders;
  }, [reminders, filter]);

  const handleToggleComplete = async (reminder: ReminderResponse) => {
    try {
      const updated = await api.updateReminder(reminder.id, {
        isCompleted: !reminder.isCompleted,
      });
      setReminders((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r)),
      );
    } catch (err) {
      console.error('Error actualizando recordatorio:', err);
    }
  };

  const pendingCount = reminders.filter((r) => !r.isCompleted).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Recordatorios</Text>
          <Text style={styles.subtitle}>
            {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <FilterChips value={filter} onChange={setFilter} counts={counts} />

      <FlatList
        data={filteredReminders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReminderCard
            reminder={item}
            onPress={() =>
              navigation.navigate('ReminderForm', { reminderId: item.id })
            }
            onToggleComplete={() => handleToggleComplete(item)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadReminders();
            }}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>
                {filter === 'completed'
                  ? 'Sin completados'
                  : filter === 'pending'
                    ? 'Sin pendientes'
                    : 'Sin recordatorios'}
              </Text>
              <Text style={styles.emptyText}>
                {filter === 'all'
                  ? 'Crea tu primer recordatorio con el botón +'
                  : 'Prueba otro filtro o crea uno nuevo'}
              </Text>
            </View>
          ) : null
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ReminderForm', {})}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  heading: {
    ...typography.heading,
    fontSize: 24,
  },
  subtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  empty: {
    alignItems: 'center',
    paddingTop: spacing.xl * 2,
  },
  emptyTitle: {
    ...typography.heading,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.caption,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  fabText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
  },
});
