import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Switch,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { openGoogleAuth } from '../services/googleAuth';
import { Button } from '../components/Button';
import { colors, spacing, typography } from '../theme';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const [calendarStatus, setCalendarStatus] = useState<{
    connected: boolean;
    message: string;
  } | null>(null);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connectingGoogle, setConnectingGoogle] = useState(false);

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

  const handleConnectGoogle = async () => {
    setConnectingGoogle(true);
    try {
      await openGoogleAuth();
    } finally {
      setConnectingGoogle(false);
    }
  };

  const toggleEmail = async (value: boolean) => {
    setEmailEnabled(value);
    try {
      await api.updateNotificationPrefs(value);
    } catch {
      setEmailEnabled(!value);
    }
  };

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
        <Text style={[styles.cardLabel, styles.spaced]}>Email</Text>
        <Text style={styles.cardValue}>{user?.email}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Google Calendar</Text>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.dot,
                  calendarStatus?.connected
                    ? styles.dotOn
                    : styles.dotOff,
                ]}
              />
              <Text style={styles.statusText}>
                {calendarStatus?.connected ? 'Conectado' : 'No conectado'}
              </Text>
            </View>
            {!calendarStatus?.connected && (
              <Button
                title="Conectar con Google"
                onPress={handleConnectGoogle}
                loading={connectingGoogle}
                style={styles.googleBtn}
              />
            )}
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Notificaciones</Text>
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Text style={styles.switchLabel}>Email (web)</Text>
            <Text style={styles.switchHint}>
              Recibe recordatorios por correo
            </Text>
          </View>
          <Switch
            value={emailEnabled}
            onValueChange={toggleEmail}
            trackColor={{ true: colors.primary }}
          />
        </View>
        {Platform.OS !== 'web' && (
          <Text style={styles.pushHint}>
            Las notificaciones push se activan al iniciar sesión en la app
            móvil.
          </Text>
        )}
      </View>

      <Button title="Cerrar sesión" variant="secondary" onPress={logout} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  title: { ...typography.title, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLabel: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  spaced: { marginTop: spacing.md },
  cardValue: {
    fontSize: 16,
    color: colors.text,
    marginTop: 4,
    fontWeight: '500',
  },
  sectionTitle: { ...typography.heading, fontSize: 17, marginBottom: spacing.md },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.sm },
  dotOn: { backgroundColor: colors.success },
  dotOff: { backgroundColor: colors.textMuted },
  statusText: { fontSize: 15, fontWeight: '600', color: colors.text },
  googleBtn: { marginTop: spacing.sm },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchInfo: { flex: 1, marginRight: spacing.md },
  switchLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
  switchHint: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  pushHint: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.md,
    lineHeight: 18,
  },
});
