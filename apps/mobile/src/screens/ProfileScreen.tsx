
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Screen } from '../components/ui';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out of LingoRoots?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: () => {
            void performLogout();
          },
        },
      ],
    );
  }

  async function performLogout() {
    try {
      setLoggingOut(true);
      await logout();
    } catch {
      // Local credentials are cleared by AuthContext even if the
      // network request fails. The next login can establish a new session.
    } finally {
      setLoggingOut(false);
    }
  }

  const initial = user?.name?.trim().charAt(0).toUpperCase() || '?';

  return (
    <Screen>
      <Text style={styles.eyebrow}>YOUR ACCOUNT</Text>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        <Text style={styles.name}>{user?.name ?? 'Learner'}</Text>
        <Text style={styles.description}>{user?.email}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Your learning account</Text>
        <Text style={styles.infoText}>
          Your account gives you access to your courses, lessons and learning
          progress.
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        style={styles.logoutButton}
        onPress={() => void handleLogout()}
        disabled={loggingOut}
      >
        {loggingOut ? (
          <ActivityIndicator color="#B42318" />
        ) : (
          <Text style={styles.logoutText}>Log out</Text>
        )}
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: colors.forestLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  title: {
    color: colors.text,
    fontSize: 29,
    fontWeight: '800',
    marginTop: 10,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 25,
    marginTop: 28,
  },
  avatar: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: colors.softGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.forest,
    fontSize: 29,
    fontWeight: '800',
  },
  name: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    marginTop: 15,
  },
  description: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 6,
  },
  infoCard: {
    backgroundColor: colors.softGreen,
    borderRadius: 16,
    padding: 18,
    marginTop: 20,
  },
  infoTitle: {
    color: colors.forest,
    fontSize: 15,
    fontWeight: '800',
  },
  infoText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 21,
    marginTop: 8,
  },
  logoutButton: {
    minHeight: 52,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#F2C7C4',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
  logoutText: {
    color: '#B42318',
    fontSize: 14,
    fontWeight: '800',
  },
});
