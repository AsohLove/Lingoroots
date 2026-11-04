
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getMyProgress, type ProgressSummary } from '../api/progress';
import { Screen } from '../components/ui';
import { colors } from '../theme/colors';

import { useFocusEffect } from '@react-navigation/native';

export default function ProgressScreen() {
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProgress = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const result = await getMyProgress();
      setProgress(result);
    } catch (err) {
      console.error('Progress loading error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'We could not load your progress.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [loadProgress]),
  );

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.eyebrow}>YOUR JOURNEY</Text>
        <Text style={styles.title}>Your progress</Text>
        <Text style={styles.description}>
          Every lesson you complete brings you one step closer.
        </Text>

        <Pressable
          style={styles.refreshButton}
          onPress={() => loadProgress(true)}
          disabled={refreshing}
        >
          <Text style={styles.refreshText}>
            {refreshing ? 'Refreshing...' : 'Refresh progress'}
          </Text>
        </Pressable>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.forest} />
            <Text style={styles.muted}>Loading your progress...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              Unable to load progress
            </Text>
            <Text style={styles.emptyDescription}>{error}</Text>
            <Pressable
              style={styles.retryButton}
              onPress={() => loadProgress()}
            >
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : progress ? (
          <>
            <View style={styles.stats}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {progress.totalStarted}
                </Text>
                <Text style={styles.statLabel}>Started</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {progress.totalCompleted}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {progress.totalInProgress}
                </Text>
                <Text style={styles.statLabel}>In progress</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Your lessons</Text>

            {progress.lessons.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.icon}>🌱</Text>
                <Text style={styles.emptyTitle}>
                  Your journey starts here
                </Text>
                <Text style={styles.emptyDescription}>
                  Open a lesson and begin learning. Your activity will
                  appear here.
                </Text>
              </View>
            ) : (
              progress.lessons.map((item) => (
                <View key={item.id} style={styles.lessonCard}>
                  <View style={styles.lessonHeader}>
                    <Text style={styles.lessonName}>
                      {item.lesson.name}
                    </Text>

                    <View
                      style={[
                        styles.statusBadge,
                        item.status === 'COMPLETED'
                          ? styles.completedBadge
                          : styles.inProgressBadge,
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {item.status === 'COMPLETED'
                          ? 'Completed'
                          : 'In progress'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.lessonMeta}>
                    {item.lesson.unit.level.course.language.name}
                    {' · '}
                    {item.lesson.unit.level.course.name}
                  </Text>

                  <Text style={styles.lessonMeta}>
                    {item.lesson.unit.level.code}
                    {' · '}
                    {item.lesson.unit.name}
                  </Text>

                  <Text style={styles.dateText}>
                    Started {new Date(item.startedAt).toLocaleDateString()}
                  </Text>

                  {item.completedAt ? (
                    <Text style={styles.completedDate}>
                      Completed{' '}
                      {new Date(item.completedAt).toLocaleDateString()}
                    </Text>
                  ) : null}
                </View>
              ))
            )}
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 35,
  },
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
  refreshButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.softGreen,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 18,
  },
  refreshText: {
    color: colors.forest,
    fontSize: 13,
    fontWeight: '800',
  },
  center: {
    alignItems: 'center',
    padding: 35,
  },
  muted: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 12,
  },
  stats: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 25,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statNumber: {
    color: colors.forest,
    fontSize: 25,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    marginTop: 30,
    marginBottom: 14,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 25,
    alignItems: 'center',
    marginTop: 15,
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
  lessonCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 17,
    marginBottom: 12,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  lessonName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
  },
  completedBadge: {
    backgroundColor: '#E5F5E9',
  },
  inProgressBadge: {
    backgroundColor: '#FFF3DC',
  },
  statusText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '800',
  },
  lessonMeta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 8,
  },
  dateText: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 13,
  },
  completedDate: {
    color: colors.forest,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 5,
  },
  retryButton: {
    backgroundColor: colors.softGreen,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 16,
  },
  retryText: {
    color: colors.forest,
    fontWeight: '800',
  },
});
