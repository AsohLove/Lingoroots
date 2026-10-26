import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

import { API_BASE_URL } from "./src/config/api";
import { getLanguages, type Language } from "./src/api/languages";
import { getCoursesByLanguage, type Course } from "./src/api/courses";
import { getUnitsByLevel, type Unit } from "./src/api/units";

export default function App() {
  const [apiStatus, setApiStatus] = useState("Checking...");
  const [languages, setLanguages] = useState<Language[]>([]);
  const [languageStatus, setLanguageStatus] = useState("Loading...");
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseStatus, setCourseStatus] = useState("Waiting...");
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitStatus, setUnitStatus] = useState("Waiting...");

  useEffect(() => {
    async function loadData() {
      try {
        const healthResponse = await fetch(`${API_BASE_URL}/health`);

        if (!healthResponse.ok) {
          throw new Error("Health check failed");
        }

        const healthData = await healthResponse.json();

        if (healthData.status === "ok") {
          setApiStatus("Connected ✓");
        }

        const languagesData = await getLanguages();

        setLanguages(languagesData);
        setLanguageStatus("Loaded ✓");

        if (languagesData.length > 0) {
          const firstLanguage = languagesData[0];

          const coursesData = await getCoursesByLanguage(firstLanguage.id);

          setCourses(coursesData);
          setCourseStatus("Loaded ✓");

          const firstCourse = coursesData[0];

          if (firstCourse?.levels.length > 0) {
            const firstLevel = firstCourse.levels[0];

            const unitsData = await getUnitsByLevel(firstLevel.id);

            setUnits(unitsData);
            setUnitStatus("Loaded ✓");
          } else {
            setUnitStatus("No level available");
          }
        } else {
          setCourseStatus("No language available");
        }
      } catch {
        setApiStatus("Connection failed");
        setLanguageStatus("Failed to load");
        setUnitStatus("Failed to load");
      }
    }

    loadData();
  }, []);

  return (
    <View style={styles.container}>
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

            {course.levels.map((level) => (
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

            <View style={styles.unitsSection}>
              <Text style={styles.unitSectionTitle}>Units</Text>

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
          </View>
        ))}
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
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
  unitsSection: {
    marginTop: 16,
  },
  unitSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
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
});