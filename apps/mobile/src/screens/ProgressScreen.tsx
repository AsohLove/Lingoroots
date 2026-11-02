import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/ui';
import { colors } from '../theme/colors';

export default function ProgressScreen() {
  return (
    <Screen>
      <Text style={styles.eyebrow}>YOUR JOURNEY</Text>
      <Text style={styles.title}>Your progress</Text>
      <Text style={styles.description}>
        Every lesson you complete brings you one step closer.
      </Text>

      <View style={styles.emptyCard}>
        <Text style={styles.icon}>🌱</Text>
        <Text style={styles.emptyTitle}>Your journey starts here</Text>
        <Text style={styles.emptyDescription}>
          Once you begin completing lessons, your learning activity and
          achievements will appear here.
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
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 9,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 25,
    alignItems: 'center',
    marginTop: 35,
  },
  icon: {
    fontSize: 42,
    marginBottom: 18,
  },
  emptyTitle: {
    color: colors.forest,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 10,
  },
});