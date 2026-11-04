
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import {
  getLessonContent,
  type LessonContent,
} from '../api/lessonContent';
import {
  getExercises,
  submitExerciseAnswer,
  type Exercise,
  type ExerciseAttemptResult,
} from '../api/exercises';
import { startLessonProgress } from '../api/progress';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Lesson'>;

export default function LessonScreen({ route }: Props) {
  const { unitId, lessonId, lessonName } = route.params;

  const [content, setContent] = useState<LessonContent | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [textAnswers, setTextAnswers] = useState<
    Record<string, string>
  >({});
  const [results, setResults] = useState<
    Record<string, ExerciseAttemptResult>
  >({});

  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLesson = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [lessonContent, lessonExercises] = await Promise.all([
        getLessonContent(unitId, lessonId),
        getExercises(lessonId),
        startLessonProgress(lessonId),
      ]);

      setContent(lessonContent);
      setExercises(lessonExercises);
    } catch (err) {
      console.error('Lesson loading error:', err);
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
    loadLesson();
  }, [loadLesson]);

  const submitAnswer = async (exercise: Exercise) => {
    if (submittingId) {
      return;
    }

    const answer =
      exercise.type === 'MULTIPLE_CHOICE'
        ? selectedOptions[exercise.id]
          ? { selectedOptionId: selectedOptions[exercise.id] }
          : null
        : textAnswers[exercise.id]?.trim()
          ? { submittedText: textAnswers[exercise.id].trim() }
          : null;

    if (!answer) {
      return;
    }

    setSubmittingId(exercise.id);

    try {
      const result = await submitExerciseAnswer(
        exercise.id,
        answer,
      );

      setResults((previous) => ({
        ...previous,
        [exercise.id]: result,
      }));
    } catch (err) {
      console.error('Exercise submission error:', err);
      setResults((previous) => ({
        ...previous,
        [exercise.id]: {
          attemptId: '',
          isCorrect: false,
          explanation:
            err instanceof Error
              ? err.message
              : 'We could not submit your answer. Try again.',
          submittedAt: '',
        },
      }));
    } finally {
      setSubmittingId(null);
    }
  };

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

        <Pressable style={styles.retryButton} onPress={loadLesson}>
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
      keyboardShouldPersistTaps="handled"
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

      <Text style={styles.sectionTitle}>Practice exercises</Text>
      <Text style={styles.practiceDescription}>
        Test what you have learned. Complete every exercise correctly to
        finish this lesson.
      </Text>

      {exercises.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.muted}>
            No exercises are available for this lesson yet.
          </Text>
        </View>
      ) : (
        exercises.map((exercise, index) => {
          const result = results[exercise.id];
          const submitting = submittingId === exercise.id;

          return (
            <View key={exercise.id} style={styles.exerciseCard}>
              <Text style={styles.number}>
                EXERCISE {index + 1} OF {exercises.length}
              </Text>

              <Text style={styles.exerciseType}>
                {exercise.type === 'MULTIPLE_CHOICE'
                  ? 'Choose one answer'
                  : 'Write your answer'}
              </Text>

              <Text style={styles.exercisePrompt}>
                {exercise.prompt}
              </Text>

              {exercise.type === 'MULTIPLE_CHOICE' ? (
                exercise.options.map((option) => {
                  const selected =
                    selectedOptions[exercise.id] === option.id;

                  return (
                    <Pressable
                      key={option.id}
                      disabled={!!result || submitting}
                      onPress={() =>
                        setSelectedOptions((previous) => ({
                          ...previous,
                          [exercise.id]: option.id,
                        }))
                      }
                      style={[
                        styles.option,
                        selected && styles.selectedOption,
                      ]}
                    >
                      <View
                        style={[
                          styles.radio,
                          selected && styles.selectedRadio,
                        ]}
                      />

                      <Text style={styles.optionText}>
                        {option.text}
                      </Text>
                    </Pressable>
                  );
                })
              ) : (
                <TextInput
                  value={textAnswers[exercise.id] ?? ''}
                  onChangeText={(value) =>
                    setTextAnswers((previous) => ({
                      ...previous,
                      [exercise.id]: value,
                    }))
                  }
                  editable={!result && !submitting}
                  placeholder="Type your answer..."
                  placeholderTextColor={colors.muted}
                  autoCapitalize="none"
                  style={styles.answerInput}
                />
              )}

              {!result ? (
                <Pressable
                  disabled={
                    submitting ||
                    (exercise.type === 'MULTIPLE_CHOICE'
                      ? !selectedOptions[exercise.id]
                      : !textAnswers[exercise.id]?.trim())
                  }
                  onPress={() => submitAnswer(exercise)}
                  style={[
                    styles.submitButton,
                    (submitting ||
                      (exercise.type === 'MULTIPLE_CHOICE'
                        ? !selectedOptions[exercise.id]
                        : !textAnswers[exercise.id]?.trim())) &&
                      styles.disabledButton,
                  ]}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitText}>
                      Check answer
                    </Text>
                  )}
                </Pressable>
              ) : (
                <View
                  style={[
                    styles.feedback,
                    result.attemptId
                      ? result.isCorrect
                        ? styles.correctFeedback
                        : styles.incorrectFeedback
                      : styles.errorFeedback,
                  ]}
                >
                  <Text style={styles.feedbackTitle}>
                    {!result.attemptId
                      ? 'Submission failed'
                      : result.isCorrect
                        ? 'Correct! Well done.'
                        : 'Not quite. Try again.'}
                  </Text>

                  {result.explanation ? (
                    <Text style={styles.feedbackText}>
                      {result.explanation}
                    </Text>
                  ) : null}

                  {!result.attemptId ? (
                    <Pressable
                      onPress={() =>
                        setResults((previous) => {
                          const next = { ...previous };
                          delete next[exercise.id];
                          return next;
                        })
                      }
                    >
                      <Text style={styles.retryText}>Retry submission</Text>
                    </Pressable>
                  ) : null}

                  {result.attemptId && !result.isCorrect ? (
                    <Pressable
                      onPress={() => {
                        setResults((previous) => {
                          const next = { ...previous };
                          delete next[exercise.id];
                          return next;
                        });
                        setSelectedOptions((previous) => ({
                          ...previous,
                          [exercise.id]: '',
                        }));
                        setTextAnswers((previous) => ({
                          ...previous,
                          [exercise.id]: '',
                        }));
                      }}
                    >
                      <Text style={styles.retryText}>Try again</Text>
                    </Pressable>
                  ) : null}
                </View>
              )}
            </View>
          );
        })
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
    marginTop: 12,
  },
  practiceDescription: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
  },
  exerciseCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  exerciseType: {
    color: colors.forestLight,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 14,
  },
  exercisePrompt: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 25,
    marginTop: 8,
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 9,
  },
  selectedOption: {
    borderColor: colors.forest,
    backgroundColor: colors.softGreen,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.muted,
    marginRight: 12,
  },
  selectedRadio: {
    borderColor: colors.forest,
    backgroundColor: colors.forest,
  },
  optionText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  answerInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: colors.text,
    fontSize: 15,
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: colors.forest,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.45,
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  feedback: {
    padding: 14,
    borderRadius: 12,
    marginTop: 14,
  },
  correctFeedback: {
    backgroundColor: '#E5F5E9',
  },
  incorrectFeedback: {
    backgroundColor: '#FFF3DC',
  },
  errorFeedback: {
    backgroundColor: '#FCE8E8',
  },
  feedbackTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  feedbackText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
  },
});
