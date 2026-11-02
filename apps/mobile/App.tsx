
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ScrollView } from "react-native";

import { API_BASE_URL } from "./src/config/api";
import { getLanguages, type Language } from "./src/api/languages";
import {
  getCoursesByLanguage,
  getLevelsByCourse,
  type Course,
  type Level,
} from "./src/api/courses";
import { getUnitsByLevel, type Unit } from "./src/api/units";
import { getLessonsByUnit, type Lesson } from "./src/api/lessons";
import {
  getLessonContent,
  type LessonContent,
} from "./src/api/lessonContent";

import LessonScreen from "./src/screens/LessonScreen";

export default function App() {
  const [apiStatus, setApiStatus] = useState("Checking...");

  const [languages, setLanguages] = useState<Language[]>([]);
  const [languageStatus, setLanguageStatus] = useState("Waiting...");

  const [courses, setCourses] = useState<Course[]>([]);
  const [courseStatus, setCourseStatus] = useState("Waiting...");

  const [levels, setLevels] = useState<Level[]>([]);
  const [levelStatus, setLevelStatus] = useState("Waiting...");

  const [units, setUnits] = useState<Unit[]>([]);
  const [unitStatus, setUnitStatus] = useState("Waiting...");

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonStatus, setLessonStatus] = useState("Waiting...");

  const [lessonContent, setLessonContent] =
    useState<LessonContent | null>(null);
  const [lessonContentStatus, setLessonContentStatus] =
    useState("Waiting...");

  useEffect(() => {
    async function loadData() {
      // 1. Check API connection
      try {
        const response = await fetch(`${API_BASE_URL}/health`);

        if (!response.ok) {
          throw new Error(`Health check failed: ${response.status}`);
        }

        setApiStatus("Connected ✓");
      } catch (error) {
        console.error("API health check:", error);
        setApiStatus("Connection failed");
        return;
      }

      // 2. Load languages
      let languagesData: Language[];

      try {
        languagesData = await getLanguages();
        setLanguages(languagesData);
        setLanguageStatus("Loaded ✓");
      } catch (error) {
        console.error("Loading languages:", error);
        setLanguageStatus("Failed to load");
        return;
      }

      if (languagesData.length === 0) {
        setLanguageStatus("No language available");
        return;
      }

      // 3. Load courses
      let coursesData: Course[];

      try {
        coursesData = await getCoursesByLanguage(languagesData[0].id);
        setCourses(coursesData);
        setCourseStatus("Loaded ✓");
      } catch (error) {
        console.error("Loading courses:", error);
        setCourseStatus("Failed to load");
        return;
      }

      if (coursesData.length === 0) {
        setCourseStatus("No course available");
        return;
      }

      // 4. Load levels
      let levelsData: Level[];

      try {
        levelsData = await getLevelsByCourse(coursesData[0].id);
        setLevels(levelsData);
        setLevelStatus("Loaded ✓");
      } catch (error) {
        console.error("Loading levels:", error);
        setLevelStatus("Failed to load");
        return;
      }

      if (levelsData.length === 0) {
        setLevelStatus("No level available");
        return;
      }

      // 5. Load units
      let unitsData: Unit[];

      try {
        unitsData = await getUnitsByLevel(levelsData[0].id);
        setUnits(unitsData);
        setUnitStatus("Loaded ✓");
      } catch (error) {
        console.error("Loading units:", error);
        setUnitStatus("Failed to load");
        return;
      }

      if (unitsData.length === 0) {
        setUnitStatus("No unit available");
        return;
      }

      // 6. Load lessons
      let lessonsData: Lesson[];

      try {
        lessonsData = await getLessonsByUnit(unitsData[0].id);
        setLessons(lessonsData);
        setLessonStatus("Loaded ✓");
      } catch (error) {
        console.error("Loading lessons:", error);
        setLessonStatus("Failed to load");
        return;
      }

      if (lessonsData.length === 0) {
        setLessonStatus("No lesson available");
        return;
      }

      // 7. Load lesson content
      try {
        const content = await getLessonContent(
          unitsData[0].id,
          lessonsData[0].id,
        );

        setLessonContent(content);
        setLessonContentStatus("Loaded ✓");
      } catch (error) {
        console.error("Loading lesson content:", error);
        setLessonContentStatus("Failed to load");
      }
    }

    loadData();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>LingoRoots</Text>

      <Text style={styles.subtitle}>
        Learn languages. Preserve connections.
      </Text>

      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>API Connection</Text>
        <Text style={styles.statusText}>{apiStatus}</Text>
      </View>

      <View style={styles.languagesCard}>
        <Text style={styles.sectionTitle}>Available Languages</Text>
        <Text style={styles.statusText}>{languageStatus}</Text>

        {languages.map((language) => (
          <View key={language.id} style={styles.languageItem}>
            <Text style={styles.languageName}>{language.name}</Text>
            {language.description && (
              <Text style={styles.languageDescription}>
                {language.description}
              </Text>
            )}
          </View>
        ))}
      </View>

      <View style={styles.coursesCard}>
        <Text style={styles.sectionTitle}>Courses</Text>
        <Text style={styles.statusText}>{courseStatus}</Text>

        {courses.map((course) => (
          <View key={course.id} style={styles.courseItem}>
            <Text style={styles.courseName}>{course.name}</Text>

            {course.description && (
              <Text style={styles.courseDescription}>
                {course.description}
              </Text>
            )}
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Levels</Text>
          <Text style={styles.statusText}>{levelStatus}</Text>

          {levels.map((level) => (
            <View key={level.id} style={styles.levelItem}>
              <Text style={styles.levelCode}>{level.code}</Text>
              <Text style={styles.levelName}>{level.name}</Text>

              {level.description && (
                <Text style={styles.levelDescription}>
                  {level.description}
                </Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Units</Text>
          <Text style={styles.statusText}>{unitStatus}</Text>

          {units.map((unit) => (
            <View key={unit.id} style={styles.unitItem}>
              <Text style={styles.unitName}>
                Unit {unit.order} — {unit.name}
              </Text>
              {unit.description && (
                <Text style={styles.unitDescription}>
                  {unit.description}
                </Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lessons</Text>
          <Text style={styles.statusText}>{lessonStatus}</Text>

          {lessons.map((lesson) => (
            <View key={lesson.id} style={styles.lessonItem}>
              <Text style={styles.lessonName}>
                Lesson {lesson.order} — {lesson.name}
              </Text>
              {lesson.description && (
                <Text style={styles.lessonDescription}>
                  {lesson.description}
                </Text>
              )}
            </View>
          ))}
        </View>

        <Text style={styles.statusText}>
          Lesson content: {lessonContentStatus}
        </Text>

        {lessonContent && (
          <LessonScreen lessonContent={lessonContent} />
        )}
      </View>

      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  statusCard: {
    width: "100%",
    padding: 20,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
  },
  languagesCard: {
    width: "100%",
    padding: 20,
    borderWidth: 1,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  languageItem: {
    marginTop: 16,
  },
  languageName: {
    fontSize: 18,
    fontWeight: "600",
  },
  languageDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  coursesCard: {
    width: "100%",
    padding: 20,
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 16,
  },
  courseItem: {
    marginTop: 16,
  },
  courseName: {
    fontSize: 18,
    fontWeight: "600",
  },
  courseDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    marginTop: 20,
  },
  levelItem: {
    marginTop: 12,
    paddingLeft: 12,
    borderLeftWidth: 2,
  },
  levelCode: {
    fontSize: 14,
    fontWeight: "700",
  },
  levelName: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 2,
  },
  levelDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  unitItem: {
    marginTop: 12,
    paddingLeft: 12,
    borderLeftWidth: 2,
  },
  unitName: {
    fontSize: 16,
    fontWeight: "600",
  },
  unitDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  lessonItem: {
    marginTop: 12,
    paddingLeft: 12,
    borderLeftWidth: 2,
  },
  lessonName: {
    fontSize: 16,
    fontWeight: "600",
  },
  lessonDescription: {
    fontSize: 14,
    marginTop: 4,
  },
});
