import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { LessonContent } from "../api/lessonContent";

type LessonScreenProps = {
  lessonContent: LessonContent;
};

export default function LessonScreen({
  lessonContent,
}: LessonScreenProps) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>{lessonContent.name}</Text>

      {lessonContent.description && (
        <Text style={styles.description}>
          {lessonContent.description}
        </Text>
      )}

      <Text style={styles.sectionTitle}>
        Vocabulary
      </Text>

      {lessonContent.vocabularyItems.map((item) => (
        <View key={item.id} style={styles.contentItem}>
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
      ))}

      <Text style={styles.sectionTitle}>
        Expressions
      </Text>

      {lessonContent.expressions.map((expression) => (
        <View key={expression.id} style={styles.contentItem}>
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
      ))}

      <Text style={styles.sectionTitle}>
        Example Sentences
      </Text>

      {lessonContent.exampleSentences.map((sentence) => (
        <View key={sentence.id} style={styles.contentItem}>
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
      ))}
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
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },

  description: {
    fontSize: 16,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 12,
  },

  contentItem: {
    marginTop: 12,
    paddingLeft: 12,
    borderLeftWidth: 2,
  },

  term: {
    fontSize: 17,
    fontWeight: "600",
  },

  translation: {
    fontSize: 16,
    marginTop: 4,
  },

  explanation: {
    fontSize: 14,
    marginTop: 4,
  },
});