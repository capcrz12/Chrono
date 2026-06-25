import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RecurrenceType } from '@chrono/shared';
import { api } from '../services/api';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors, spacing, typography } from '../theme';

const RECURRENCE_OPTIONS = [
  { value: RecurrenceType.NONE, label: 'Sin repetición' },
  { value: RecurrenceType.DAILY, label: 'Diario' },
  { value: RecurrenceType.WEEKLY, label: 'Semanal' },
  { value: RecurrenceType.CUSTOM, label: 'Personalizado' },
];

export function CreateReminderScreen() {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [datetime, setDatetime] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>(RecurrenceType.NONE);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }

    const dateValue = datetime || new Date(Date.now() + 3600000).toISOString();
    setLoading(true);
    try {
      await api.createReminder({
        title: title.trim(),
        description: description.trim() || undefined,
        datetime: new Date(dateValue).toISOString(),
        recurrence,
      });
      navigation.goBack();
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'No se pudo crear el recordatorio',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Nuevo recordatorio</Text>

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
        label="Fecha y hora (ISO)"
        placeholder="2026-06-25T10:00:00.000Z"
        value={datetime}
        onChangeText={setDatetime}
      />

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
        title="Crear recordatorio"
        onPress={handleCreate}
        loading={loading}
        style={styles.submit}
      />

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
});
