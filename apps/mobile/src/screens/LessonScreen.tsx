
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { LessonContent } from "../api/lessonContent";

type LessonScreenProps = {
  lessonContent: LessonContent;
};

export default function LessonScreen({
  lessonContent,
}: LessonScreenProps) {
  const hasVocabulary = lessonContent.vocabularyItems.length > 0;
  const hasExpressions = lessonContent.expressions.length > 0;
  const hasExamples = lessonContent.exampleSentences.length > 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>LESSON</Text>

        <Text style={styles.title}>
          {lessonContent.name}
        </Text>

        {lessonContent.description && (
          <Text style={styles.description}>
            {lessonContent.description}
          </Text>
        )}
      </View>

      <View style={styles.progressInfo}>
        <Text style={styles.progressText}>
          {lessonContent.vocabularyItems.length} vocabulary items
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vocabulary</Text>

        {hasVocabulary ? (
          lessonContent.vocabularyItems.map((item, index) => (
            <View key={item.id} style={styles.contentItem}>
              <View style={styles.itemNumber}>
                <Text style={styles.itemNumberText}>
                  {index + 1}
                </Text>
              </View>

              <View style={styles.itemBody}>
                <Text style={styles.term}>{item.term}</Text>

                <Text style={styles.translation}>
                  {item.meaning}
                </Text>

                {item.explanation && (
                  <Text style={styles.explanation}>
                    {item.explanation}
                  </Text>
                )}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>
            No published vocabulary is available for this lesson yet.
          </Text>
        )}
      </View>

      {hasExpressions && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expressions</Text>

          {lessonContent.expressions.map((expression) => (
            <View key={expression.id} style={styles.contentItem}>
              <View style={styles.itemBody}>
                <Text style={styles.term}>
                  {expression.text}
                </Text>

                <Text style={styles.translation}>
                  {expression.translation}
                </Text>

                {expression.explanation && (
                  <Text style={styles.explanation}>
                    {expression.explanation}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {hasExamples && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Example Sentences
          </Text>

          {lessonContent.exampleSentences.map((sentence) => (
            <View key={sentence.id} style={styles.contentItem}>
              <View style={styles.itemBody}>
                <Text style={styles.term}>
                  {sentence.text}
                </Text>

                <Text style={styles.translation}>
                  {sentence.translation}
                </Text>

                {sentence.explanation && (
                  <Text style={styles.explanation}>
                    {sentence.explanation}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  contentContainer: {
    padding: 24,
    paddingBottom: 48,
  },

  header: {
    marginBottom: 24,
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#64748B",
    marginBottom: 8,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
  },

  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#64748B",
    marginTop: 8,
  },

  progressInfo: {
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },

  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },

  section: {
    marginTop: 24,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },

  contentItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  itemNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  itemNumberText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },

  itemBody: {
    flex: 1,
  },

  term: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },

  translation: {
    fontSize: 16,
    color: "#334155",
    marginTop: 6,
  },

  explanation: {
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
    marginTop: 8,
  },

  emptyText: {
    fontSize: 15,
    lineHeight: 23,
    color: "#64748B",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
  },
});
