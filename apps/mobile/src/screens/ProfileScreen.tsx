import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/ui';
import { colors } from '../theme/colors';

export default function ProfileScreen() {
  return (
    <Screen>
      <Text style={styles.eyebrow}>YOUR ACCOUNT</Text>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>L</Text>
        </View>

        <Text style={styles.name}>Learner profile</Text>
        <Text style={styles.description}>
          Your personal learning space.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Coming up next</Text>
        <Text style={styles.infoText}>
          Account sign-in, personal details, preferences and learning settings
          will be added in the next development milestones.
        </Text>
      </View>
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
});