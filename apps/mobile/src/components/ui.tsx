import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function ActionButton({
  label,
  onPress,
  variant = 'dark',
}: {
  label: string;
  onPress: () => void;
  variant?: 'dark' | 'light';
}) {
  const light = variant === 'light';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: light ? colors.lime : colors.forest },
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          { color: light ? colors.forest : '#FFFFFF' },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Pill({ children }: { children: ReactNode }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 32,
  },
  section: {
    marginTop: 30,
    marginBottom: 16,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 5,
    lineHeight: 19,
  },
  button: {
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.lime,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillText: {
    color: colors.forest,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
});