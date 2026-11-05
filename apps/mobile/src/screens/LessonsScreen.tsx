import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { getLessonsByUnit, type Lesson } from "../api/lessons";
import type { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Lessons">;

export default function LessonsScreen({ route }: Props) {
  const { unitId, unitName } = route.params;

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  async function loadLessons() {
    setLoading(true);
    setError(null);

    try {
      const result = await getLessonsByUnit(unitId);

      setLessons([...result].sort((a, b) => a.order - b.order));
    } catch {
      setError("We could not load the lessons. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLessons();
  }, [unitId]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>UNIT CONTENT</Text>

      <Text style={styles.title}>{unitName}</Text>

      <Text style={styles.description}>
        Choose a lesson to continue learning. Work through them in order to
        build your understanding step by step.
      </Text>

      {loading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={colors.forest} />
          <Text style={styles.stateText}>Loading lessons...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>Something went wrong</Text>
          <Text style={styles.stateText}>{error}</Text>

          <Pressable onPress={loadLessons} style={styles.retryButton}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : lessons.length === 0 ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>No lessons available yet</Text>
          <Text style={styles.stateText}>
            Lessons for this unit will appear here when they are added.
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>
            {lessons.length} {lessons.length === 1 ? "Lesson" : "Lessons"}
          </Text>

          {lessons.map((lesson, index) => (
            <Pressable
              key={lesson.id}
              onPress={() => {
                navigation.navigate("Lesson", {
                  unitId,
                  lessonId: lesson.id,
                  lessonName: lesson.name,
                });
              }}
              style={styles.lessonCard}
            >
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>{index + 1}</Text>
              </View>

              <View style={styles.lessonBody}>
                <Text style={styles.lessonName}>{lesson.name}</Text>

                <Text style={styles.lessonDescription}>
                  {lesson.description || "Open this lesson to start learning."}
                </Text>
              </View>

              <Text style={styles.arrow}>→</Text>
            </Pressable>
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
  eyebrow: {
    color: colors.forestLight,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginTop: 8,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    marginTop: 10,
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 9,
    marginBottom: 26,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 14,
  },
  lessonCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  numberBadge: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: colors.softGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: {
    color: colors.forest,
    fontSize: 16,
    fontWeight: "900",
  },
  lessonBody: {
    flex: 1,
    marginLeft: 13,
  },
  lessonName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  lessonDescription: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  arrow: {
    color: colors.forest,
    fontSize: 21,
    fontWeight: "700",
    marginLeft: 10,
  },
  stateContainer: {
    padding: 35,
    alignItems: "center",
  },
  stateCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 20,
  },
  stateTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  stateText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  retryButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.softGreen,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 15,
  },
  retryText: {
    color: colors.forest,
    fontWeight: "800",
    fontSize: 13,
  },
});
