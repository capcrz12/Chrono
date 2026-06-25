import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomRecurrence, RecurrenceType } from '@chrono/shared';
import { api } from '../services/api';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { DateTimePickerField } from '../components/DateTimePickerField';
import { DurationPicker } from '../components/DurationPicker';
import { CustomRecurrencePicker } from '../components/CustomRecurrencePicker';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { parseInitialDate } from '../utils/reminderFormat';

type ScreenRoute = RouteProp<RootStackParamList, 'ReminderForm'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RECURRENCE_OPTIONS = [
  { value: RecurrenceType.NONE, label: 'No' },
  { value: RecurrenceType.DAILY, label: 'Día' },
  { value: RecurrenceType.WEEKLY, label: 'Sem' },
  { value: RecurrenceType.CUSTOM, label: 'Custom' },
];

const DEFAULT_CUSTOM: CustomRecurrence = {
  interval: 1,
  unit: 'weeks',
};

export function ReminderFormScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRoute>();
  const reminderId = route.params?.reminderId;
  const isEditing = !!reminderId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [datetime, setDatetime] = useState(() =>
    parseInitialDate(route.params?.initialDate),
  );
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null);
  const [recurrence, setRecurrence] = useState<RecurrenceType>(RecurrenceType.NONE);
  const [customRecurrence, setCustomRecurrence] =
    useState<CustomRecurrence>(DEFAULT_CUSTOM);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);

  useEffect(() => {
    if (!reminderId) return;

    async function load() {
      try {
        const reminder = await api.getReminder(reminderId);
        setTitle(reminder.title);
        setDescription(reminder.description ?? '');
        setDatetime(new Date(reminder.datetime));
        setDurationMinutes(reminder.durationMinutes);
        setRecurrence(reminder.recurrence as RecurrenceType);
        if (reminder.customRecurrence) {
          setCustomRecurrence(reminder.customRecurrence);
        }
      } catch (err) {
        Alert.alert(
          'Error',
          err instanceof Error ? err.message : 'No se pudo cargar',
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

    if (recurrence === RecurrenceType.CUSTOM && !customRecurrence) {
      Alert.alert('Error', 'Configura la recurrencia personalizada');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        datetime: datetime.toISOString(),
        durationMinutes,
        recurrence,
        customRecurrence:
          recurrence === RecurrenceType.CUSTOM ? customRecurrence : null,
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
    Alert.alert('Eliminar', '¿Eliminar este recordatorio?', [
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
            Alert.alert('Error', err instanceof Error ? err.message : 'Error');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
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
        {isEditing ? 'Editar' : 'Nuevo recordatorio'}
      </Text>

      <Input
        label="Título"
        placeholder="¿Qué necesitas recordar?"
        value={title}
        onChangeText={setTitle}
      />

      <Input
        label="Descripción"
        placeholder="Opcional"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        style={{ minHeight: 72, textAlignVertical: 'top' }}
      />

      <DateTimePickerField
        label="Cuándo"
        value={datetime}
        onChange={setDatetime}
      />

      <DurationPicker value={durationMinutes} onChange={setDurationMinutes} />

      <Text style={styles.label}>Repetir</Text>
      <View style={styles.recurrenceRow}>
        {RECURRENCE_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.recurrenceChip,
              recurrence === option.value && styles.recurrenceChipActive,
            ]}
            onPress={() => setRecurrence(option.value)}
          >
            <Text
              style={[
                styles.recurrenceText,
                recurrence === option.value && styles.recurrenceTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {recurrence === RecurrenceType.CUSTOM && (
        <CustomRecurrencePicker
          value={customRecurrence}
          onChange={setCustomRecurrence}
        />
      )}

      <Button
        title={isEditing ? 'Guardar' : 'Crear'}
        onPress={handleSave}
        loading={loading}
        style={styles.submit}
      />

      {isEditing && (
        <Button
          title="Eliminar"
          variant="danger"
          onPress={handleDelete}
          disabled={loading}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: { color: colors.textSecondary },
  title: {
    ...typography.title,
    fontSize: 24,
    marginBottom: spacing.lg,
    marginTop: Platform.OS === 'ios' ? spacing.md : 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  recurrenceRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  recurrenceChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recurrenceChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  recurrenceText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  recurrenceTextActive: { color: '#FFF' },
  submit: { marginTop: spacing.md, marginBottom: spacing.sm },
});
