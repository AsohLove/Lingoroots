import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import {
  getLessonContent,
  type LessonContent,
} from '../api/lessonContent';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Lesson'>;

export default function LessonScreen({ route }: Props) {
  const { unitId, lessonId, lessonName } = route.params;

  const [content, setContent] = useState<LessonContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getLessonContent(unitId, lessonId);
      setContent(result);
    } catch (err) {
      console.error('Lesson content error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'We could not load this lesson.',
      );
    } finally {
      setLoading(false);
    }
  }, [unitId, lessonId]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.forest} />
        <Text style={styles.muted}>Loading lesson...</Text>
      </View>
    );
  }

  if (error || !content) {
    return (
      <View style={styles.center}>
        <Text style={styles.heading}>Unable to load lesson</Text>
        <Text style={styles.muted}>
          {error ?? 'Lesson content is unavailable.'}
        </Text>

        <Pressable style={styles.retryButton} onPress={loadContent}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>YOUR LESSON</Text>
      <Text style={styles.title}>{lessonName}</Text>

      {content.description ? (
        <Text style={styles.description}>{content.description}</Text>
      ) : null}

      <Text style={styles.sectionTitle}>Vocabulary</Text>

      {content.vocabularyItems.length === 0 ? (
        <Text style={styles.muted}>
          No vocabulary has been added to this lesson yet.
        </Text>
      ) : (
        content.vocabularyItems.map((item, index) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.number}>WORD {index + 1}</Text>
            <Text style={styles.term}>{item.term}</Text>
            <Text style={styles.meaning}>{item.meaning}</Text>

            {item.explanation ? (
              <Text style={styles.explanation}>{item.explanation}</Text>
            ) : null}
          </View>
        ))
      )}

      {content.expressions.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Expressions</Text>

          {content.expressions.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.term}>{item.text}</Text>
              <Text style={styles.meaning}>{item.translation}</Text>
              {item.explanation ? (
                <Text style={styles.explanation}>{item.explanation}</Text>
              ) : null}
            </View>
          ))}
        </>
      )}

      {content.exampleSentences.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Example sentences</Text>

          {content.exampleSentences.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.term}>{item.text}</Text>
              <Text style={styles.meaning}>{item.translation}</Text>
              {item.explanation ? (
                <Text style={styles.explanation}>{item.explanation}</Text>
              ) : null}
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 22,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  eyebrow: {
    color: colors.forestLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 10,
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    marginTop: 24,
    marginBottom: 14,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  number: {
    color: colors.forestLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  term: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    marginTop: 8,
  },
  meaning: {
    color: colors.forest,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 6,
  },
  explanation: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },
  muted: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    textAlign: 'center',
  },
  heading: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.softGreen,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginTop: 18,
  },
  retryText: {
    color: colors.forest,
    fontWeight: '800',
  },
});