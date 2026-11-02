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

import { getUnitsByLevel, type Unit } from "../api/units";
import type { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Units">;

export default function UnitsScreen({ route }: Props) {
  const { levelId, levelName } = route.params;

  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  async function loadUnits() {
    setLoading(true);
    setError(null);

    try {
      const result = await getUnitsByLevel(levelId);

      setUnits([...result].sort((a, b) => a.order - b.order));
    } catch {
      setError("We could not load the units. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUnits();
  }, [levelId]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>YOUR LEARNING PATH</Text>

      <Text style={styles.title}>{levelName}</Text>

      <Text style={styles.description}>
        Work through these units step by step. Each unit contains lessons that
        will help you build your understanding.
      </Text>

      {loading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={colors.forest} />
          <Text style={styles.stateText}>Loading units...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>Something went wrong</Text>
          <Text style={styles.stateText}>{error}</Text>

          <Pressable onPress={loadUnits} style={styles.retryButton}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : units.length === 0 ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>No units available yet</Text>
          <Text style={styles.stateText}>
            Units for this level will appear here when they are added.
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>
            {units.length} {units.length === 1 ? "Unit" : "Units"}
          </Text>

          {units.map((unit, index) => (
            <Pressable
              key={unit.id}
              onPress={() =>
                navigation.navigate("Lessons", {
                  unitId: unit.id,
                  unitName: unit.name,
                })
              }
              style={styles.unitCard}
            >
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>{index + 1}</Text>
              </View>

              <View style={styles.unitBody}>
                <Text style={styles.unitName}>{unit.name}</Text>

                <Text style={styles.unitDescription}>
                  {unit.description || "Explore the lessons in this unit."}
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
  unitCard: {
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
  unitBody: {
    flex: 1,
    marginLeft: 13,
  },
  unitName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  unitDescription: {
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
