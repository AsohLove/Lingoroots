import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getLanguages, type Language } from "../api/languages";
import {
  getCoursesByLanguage,
  getLevelsByCourse,
  type Course,
  type Level,
} from "../api/courses";

import { Screen, SectionHeading, Pill } from "../components/ui";
import { colors } from "../theme/colors";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

export default function ExploreScreen() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);

  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
    null,
  );
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const [loadingLanguages, setLoadingLanguages] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingLevels, setLoadingLevels] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  async function loadLanguages() {
    setLoadingLanguages(true);
    setError(null);

    try {
      const result = await getLanguages();
      setLanguages(result);
    } catch {
      setError(
        "We could not load languages. Check your connection and try again.",
      );
    } finally {
      setLoadingLanguages(false);
    }
  }

  useEffect(() => {
    loadLanguages();
  }, []);

  async function selectLanguage(language: Language) {
    setSelectedLanguage(language);
    setSelectedCourse(null);
    setCourses([]);
    setLevels([]);
    setError(null);
    setLoadingCourses(true);

    try {
      const result = await getCoursesByLanguage(language.id);
      setCourses(result);
    } catch {
      setError(
        `Could not load courses for ${language.name}. Please try again.`,
      );
    } finally {
      setLoadingCourses(false);
    }
  }

  async function selectCourse(course: Course) {
    setSelectedCourse(course);
    setLevels([]);
    setError(null);
    setLoadingLevels(true);

    try {
      const result = await getLevelsByCourse(course.id);
      setLevels(result);
    } catch {
      setError(`Could not load levels for ${course.name}. Please try again.`);
    } finally {
      setLoadingLevels(false);
    }
  }

  function resetSelection() {
    setSelectedLanguage(null);
    setSelectedCourse(null);
    setCourses([]);
    setLevels([]);
    setError(null);
  }

  return (
    <Screen>
      <Text style={styles.eyebrow}>DISCOVER SOMETHING NEW</Text>
      <Text style={styles.title}>Explore languages</Text>
      <Text style={styles.description}>
        Every language opens a door to a new way of seeing the world. Choose one
        and begin your learning journey.
      </Text>

      {/* Error state */}
      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>

          <Pressable
            onPress={() => {
              if (!selectedLanguage) {
                loadLanguages();
              } else if (!selectedCourse) {
                selectLanguage(selectedLanguage);
              } else {
                selectCourse(selectedCourse);
              }
            }}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Languages */}
      <SectionHeading
        title="Available languages"
        subtitle="Choose a language to see its learning paths."
      />

      {loadingLanguages ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.forest} />
          <Text style={styles.loadingText}>Loading languages...</Text>
        </View>
      ) : languages.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No languages available yet</Text>
          <Text style={styles.emptyText}>
            Check back later as more learning content becomes available.
          </Text>
        </View>
      ) : (
        languages.map((language) => {
          const selected = selectedLanguage?.id === language.id;

          return (
            <Pressable
              key={language.id}
              onPress={() => selectLanguage(language)}
              style={[styles.languageCard, selected && styles.selectedCard]}
            >
              <View style={styles.cardIcon}>
                <Text style={styles.cardEmoji}>🌿</Text>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.languageName}>{language.name}</Text>
                <Text style={styles.cardDescription}>
                  {language.description || "Discover and learn this language."}
                </Text>
              </View>

              <Text style={styles.arrow}>{selected ? "✓" : "→"}</Text>
            </Pressable>
          );
        })
      )}

      {/* Courses */}
      {selectedLanguage ? (
        <>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Learning paths</Text>
              <Text style={styles.sectionSubtitle}>
                Courses available for {selectedLanguage.name}.
              </Text>
            </View>

            <Pressable onPress={resetSelection}>
              <Text style={styles.changeText}>Change</Text>
            </Pressable>
          </View>

          {loadingCourses ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.forest} />
              <Text style={styles.loadingText}>Loading courses...</Text>
            </View>
          ) : courses.length === 0 && !error ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No courses yet</Text>
              <Text style={styles.emptyText}>
                Learning paths for this language will appear here when
                available.
              </Text>
            </View>
          ) : (
            courses.map((course) => {
              const selected = selectedCourse?.id === course.id;

              return (
                <Pressable
                  key={course.id}
                  onPress={() => selectCourse(course)}
                  style={[styles.courseCard, selected && styles.selectedCard]}
                >
                  <View style={styles.courseTop}>
                    <Pill>COURSE</Pill>
                    <Text style={styles.arrow}>{selected ? "✓" : "→"}</Text>
                  </View>

                  <Text style={styles.courseName}>{course.name}</Text>
                  <Text style={styles.cardDescription}>
                    {course.description ||
                      "Explore this structured learning path."}
                  </Text>
                </Pressable>
              );
            })
          )}
        </>
      ) : null}

      {/* Levels */}
      {selectedCourse ? (
        <>
          <SectionHeading
            title="Learning levels"
            subtitle={`Choose a level in ${selectedCourse.name}.`}
          />

          {loadingLevels ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.forest} />
              <Text style={styles.loadingText}>Loading levels...</Text>
            </View>
          ) : levels.length === 0 && !error ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No levels available</Text>
              <Text style={styles.emptyText}>
                This course does not have any published levels yet.
              </Text>
            </View>
          ) : (
            levels.map((level) => (
              <Pressable
                key={level.id}
                onPress={() =>
                  navigation.navigate("Units", {
                    levelId: level.id,
                    levelName: level.name,
                  })
                }
                style={styles.levelCard}
              >
                <View style={styles.levelBadge}>
                  <Text style={styles.levelCode}>{level.code}</Text>
                </View>

                <View style={styles.levelContent}>
                  <Text style={styles.levelName}>{level.name}</Text>
                  <Text style={styles.cardDescription}>
                    {level.description || "Start learning at this level."}
                  </Text>
                </View>

                <Text style={styles.arrow}>→</Text>
              </Pressable>
            ))
          )}
        </>
      ) : null}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          More languages and learning paths will be added as LingoRoots grows.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: colors.forestLight,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginTop: 8,
  },
  title: {
    color: colors.text,
    fontSize: 29,
    fontWeight: "800",
    marginTop: 10,
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 9,
  },
  languageCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 17,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  selectedCard: {
    borderColor: colors.forest,
    borderWidth: 1.5,
    backgroundColor: colors.softGreen,
  },
  cardIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: colors.softGreen,
    justifyContent: "center",
    alignItems: "center",
  },
  cardEmoji: {
    fontSize: 22,
  },
  cardContent: {
    flex: 1,
    marginLeft: 13,
  },
  languageName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  cardDescription: {
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
  sectionHeader: {
    marginTop: 22,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "700",
  },
  sectionSubtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 5,
  },
  changeText: {
    color: colors.forest,
    fontWeight: "700",
    fontSize: 12,
  },
  courseCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 17,
    padding: 17,
    marginBottom: 12,
  },
  courseTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  courseName: {
    color: colors.forest,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 13,
  },
  levelCard: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  levelBadge: {
    width: 49,
    height: 49,
    borderRadius: 14,
    backgroundColor: colors.lime,
    justifyContent: "center",
    alignItems: "center",
  },
  levelCode: {
    color: colors.forest,
    fontWeight: "900",
    fontSize: 15,
  },
  levelContent: {
    flex: 1,
    marginLeft: 13,
  },
  levelName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  loading: {
    padding: 25,
    alignItems: "center",
  },
  loadingText: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 10,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    color: colors.forest,
    fontSize: 15,
    fontWeight: "800",
  },
  emptyText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
  },
  errorCard: {
    backgroundColor: "#FCEDEC",
    borderRadius: 15,
    padding: 16,
    marginTop: 20,
  },
  errorTitle: {
    color: "#9B302A",
    fontWeight: "800",
    fontSize: 14,
  },
  errorText: {
    color: "#743D39",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 5,
  },
  retryButton: {
    alignSelf: "flex-start",
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9,
  },
  retryText: {
    color: "#9B302A",
    fontSize: 12,
    fontWeight: "800",
  },
  footer: {
    backgroundColor: colors.softGreen,
    borderRadius: 15,
    padding: 16,
    marginTop: 25,
  },
  footerText: {
    color: colors.forestLight,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
  },
});
