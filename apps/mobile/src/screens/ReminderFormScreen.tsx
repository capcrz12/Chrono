import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RecurrenceType } from '@chrono/shared';
import { api } from '../services/api';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';

type ScreenRoute = RouteProp<RootStackParamList, 'ReminderForm'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RECURRENCE_OPTIONS = [
  { value: RecurrenceType.NONE, label: 'Sin repetición' },
  { value: RecurrenceType.DAILY, label: 'Diario' },
  { value: RecurrenceType.WEEKLY, label: 'Semanal' },
  { value: RecurrenceType.CUSTOM, label: 'Personalizado' },
];

function defaultDatetimeLocal(): string {
  const d = new Date(Date.now() + 3600000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toIsoDatetime(value: string): string {
  if (!value.trim()) {
    return new Date(Date.now() + 3600000).toISOString();
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return new Date(value).toISOString();
  }
  return new Date(value).toISOString();
}

export function ReminderFormScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRoute>();
  const reminderId = route.params?.reminderId;
  const isEditing = !!reminderId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [datetime, setDatetime] = useState(defaultDatetimeLocal);
  const [recurrence, setRecurrence] = useState<RecurrenceType>(RecurrenceType.NONE);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);

  useEffect(() => {
    if (!reminderId) return;

    async function load() {
      try {
        const reminder = await api.getReminder(reminderId);
        setTitle(reminder.title);
        setDescription(reminder.description ?? '');
        setDatetime(toDatetimeLocal(reminder.datetime));
        setRecurrence(reminder.recurrence as RecurrenceType);
      } catch (err) {
        Alert.alert(
          'Error',
          err instanceof Error ? err.message : 'No se pudo cargar el recordatorio',
        );
        navigation.goBack();
      } finally {
        setLoadingData(false);
      }
    }

    load();
  }, [reminderId, navigation]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        datetime: toIsoDatetime(datetime),
        recurrence,
      };

      if (isEditing && reminderId) {
        await api.updateReminder(reminderId, payload);
      } else {
        await api.createReminder(payload);
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'No se pudo guardar',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!reminderId) return;

    Alert.alert(
      'Eliminar recordatorio',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await api.deleteReminder(reminderId);
              navigation.goBack();
            } catch (err) {
              Alert.alert(
                'Error',
                err instanceof Error ? err.message : 'No se pudo eliminar',
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  if (loadingData) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        {isEditing ? 'Editar recordatorio' : 'Nuevo recordatorio'}
      </Text>

      <Input
        label="Título"
        placeholder="¿Qué necesitas recordar?"
        value={title}
        onChangeText={setTitle}
      />

      <Input
        label="Descripción"
        placeholder="Detalles adicionales (opcional)"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        style={{ minHeight: 80, textAlignVertical: 'top' }}
      />

      <Input
        label="Fecha y hora"
        placeholder="2026-06-25T10:00"
        value={datetime}
        onChangeText={setDatetime}
      />
      <Text style={styles.hint}>Formato: AAAA-MM-DDTHH:MM</Text>

      <Text style={styles.label}>Recurrencia</Text>
      <View style={styles.recurrenceRow}>
        {RECURRENCE_OPTIONS.map((option) => (
          <Button
            key={option.value}
            title={option.label}
            variant={recurrence === option.value ? 'primary' : 'secondary'}
            onPress={() => setRecurrence(option.value)}
            style={styles.recurrenceButton}
          />
        ))}
      </View>

      <Button
        title={isEditing ? 'Guardar cambios' : 'Crear recordatorio'}
        onPress={handleSave}
        loading={loading}
        style={styles.submit}
      />

      {isEditing && (
        <Button
          title="Eliminar recordatorio"
          variant="danger"
          onPress={handleDelete}
          disabled={loading}
          style={styles.delete}
        />
      )}

      <Button
        title="Cancelar"
        variant="ghost"
        onPress={() => navigation.goBack()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textSecondary,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.lg,
    marginTop: Platform.OS === 'ios' ? spacing.md : 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  recurrenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  recurrenceButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 40,
  },
  submit: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  delete: {
    marginBottom: spacing.sm,
  },
});
