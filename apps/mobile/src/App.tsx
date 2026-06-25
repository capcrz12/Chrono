import React from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginScreen } from './screens/LoginScreen';
import { RemindersListScreen } from './screens/RemindersListScreen';
import { ReminderFormScreen } from './screens/ReminderFormScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { RootStackParamList, MainTabParamList } from './navigation/types';
import { colors } from './theme';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Lista: '☰',
    Calendario: '▦',
    Perfil: '○',
  };
  return (
    <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.45 }}>
      {icons[label] ?? '•'}
    </Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 4,
          height: 56,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name === 'Reminders' ? 'Lista' : route.name === 'Calendar' ? 'Calendario' : 'Perfil'} focused={focused} />
        ),
      })}
    >
      <Tab.Screen
        name="Reminders"
        component={RemindersListScreen}
        options={{ tabBarLabel: 'Lista' }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ tabBarLabel: 'Calendario' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="ReminderForm"
            component={ReminderFormScreen}
            options={{
              headerShown: true,
              headerTitle: '',
              headerBackTitle: 'Atrás',
              headerStyle: { backgroundColor: colors.background },
              headerShadowVisible: false,
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
