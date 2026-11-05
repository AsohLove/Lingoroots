import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import type { TabParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { ActionButton, Pill, Screen, SectionHeading } from '../components/ui';

type Props = BottomTabScreenProps<TabParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>LINGOROOTS</Text>
          <Text style={styles.tagline}>Languages. Culture. Connection.</Text>
        </View>

        <Pressable
          onPress={() => navigation.navigate('Profile')}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>L</Text>
        </Pressable>
      </View>

      <View style={styles.greeting}>
        <Text style={styles.welcome}>Welcome back 👋</Text>
        <Text style={styles.heading}>Your next chapter starts here.</Text>
        <Text style={styles.description}>
          Discover a language, connect with a culture, and learn at your own pace.
        </Text>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <Pill>START YOUR JOURNEY</Pill>
          <Text style={styles.leaf}>🌱</Text>
        </View>

        <Text style={styles.heroTitle}>
          Discover the beauty of Ewondo.
        </Text>

        <Text style={styles.heroDescription}>
          Start with the basics and build your confidence one lesson at a time.
        </Text>

        <ActionButton
          label="Explore Ewondo  →"
          variant="light"
          onPress={() => navigation.navigate('Explore')}
        />
      </View>

      <SectionHeading
        title="Your learning space"
        subtitle="Everything you need to get started."
      />

      <View style={styles.quickCard}>
        <View style={styles.quickIcon}>
          <Text style={styles.quickEmoji}>🌍</Text>
        </View>
        <View style={styles.quickText}>
          <Text style={styles.quickTitle}>Explore languages</Text>
          <Text style={styles.quickDescription}>
            Find a language you would love to learn.
          </Text>
        </View>
        <Pressable onPress={() => navigation.navigate('Explore')}>
          <Text style={styles.arrow}>→</Text>
        </Pressable>
      </View>

      <View style={styles.quickCard}>
        <View style={styles.quickIcon}>
          <Text style={styles.quickEmoji}>📚</Text>
        </View>
        <View style={styles.quickText}>
          <Text style={styles.quickTitle}>Your progress</Text>
          <Text style={styles.quickDescription}>
            Keep track of your learning journey.
          </Text>
        </View>
        <Pressable onPress={() => navigation.navigate('Progress')}>
          <Text style={styles.arrow}>→</Text>
        </Pressable>
      </View>

      <Text style={styles.footer}>
        Every language carries a story. Start discovering yours.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    color: colors.forest,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 2,
  },
  tagline: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 3,
  },
  avatar: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: colors.softGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.forest,
    fontWeight: '800',
    fontSize: 17,
  },
  greeting: {
    marginTop: 34,
    marginBottom: 24,
  },
  welcome: {
    color: colors.forestLight,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  heading: {
    color: colors.text,
    fontSize: 29,
    fontWeight: '800',
    lineHeight: 36,
    letterSpacing: -0.7,
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
  hero: {
    backgroundColor: colors.forest,
    borderRadius: 22,
    padding: 22,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 23,
  },
  leaf: {
    fontSize: 27,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 31,
    marginBottom: 10,
  },
  heroDescription: {
    color: '#D7E4DC',
    fontSize: 13,
    lineHeight: 21,
    marginBottom: 20,
  },
  quickCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickEmoji: {
    fontSize: 21,
  },
  quickText: {
    flex: 1,
    marginLeft: 13,
  },
  quickTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  quickDescription: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 4,
  },
  arrow: {
    color: colors.forest,
    fontSize: 23,
    fontWeight: '600',
    paddingLeft: 8,
  },
  footer: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: 11,
    marginTop: 25,
    lineHeight: 18,
  },
});