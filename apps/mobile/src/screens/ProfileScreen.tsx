import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Button } from '../components/Button';
import { colors, spacing, typography } from '../theme';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const [calendarStatus, setCalendarStatus] = useState<{
    connected: boolean;
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStatus = async () => {
    try {
      const status = await api.googleCalendarStatus();
      setCalendarStatus(status);
    } catch {
      setCalendarStatus({
        connected: false,
        message: 'No se pudo verificar la conexión',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStatus();
    }, []),
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadStatus();
          }}
        />
      }
    >
      <Text style={styles.title}>Perfil</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Nombre</Text>
        <Text style={styles.cardValue}>{user?.name}</Text>

        <Text style={[styles.cardLabel, styles.cardLabelSpaced]}>Email</Text>
        <Text style={styles.cardValue}>{user?.email}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Google Calendar</Text>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : (
          <>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  calendarStatus?.connected
                    ? styles.statusConnected
                    : styles.statusDisconnected,
                ]}
              />
              <Text style={styles.statusText}>
                {calendarStatus?.connected ? 'Conectado' : 'No conectado'}
              </Text>
            </View>
            <Text style={styles.statusMessage}>{calendarStatus?.message}</Text>
            {!calendarStatus?.connected && (
              <Text style={styles.hint}>
                Configura GOOGLE_CLIENT_ID en el backend y usa "Continuar con
                Google" en el login para vincular tu calendario.
              </Text>
            )}
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Acerca de</Text>
        <Text style={styles.aboutText}>
          Chrono v0.1 — Recordatorios inteligentes con sincronización de
          calendario.
        </Text>
      </View>

      <Button title="Cerrar sesión" variant="secondary" onPress={logout} />
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  cardLabelSpaced: {
    marginTop: spacing.md,
  },
  cardValue: {
    fontSize: 16,
    color: colors.text,
    marginTop: 4,
    fontWeight: '500',
  },
  sectionTitle: {
    ...typography.heading,
    fontSize: 17,
    marginBottom: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  statusConnected: {
    backgroundColor: colors.success,
  },
  statusDisconnected: {
    backgroundColor: colors.textMuted,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  statusMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.md,
    lineHeight: 18,
  },
  aboutText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  loader: {
    marginVertical: spacing.md,
  },
});
