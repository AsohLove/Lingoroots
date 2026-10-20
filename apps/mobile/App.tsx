import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { API_BASE_URL } from './src/config/api';
import { getLanguages, type Language } from './src/api/language';


export default function App() {
  const [apiStatus, setApiStatus] = useState('Checking...');
  const [languages, setLanguages] = useState<Language[]>([]);
  const [languageStatus, setLanguageStatus] = useState('Loading...');

  useEffect(() => {
    async function loadData() {
      try {
        const healthResponse = await fetch(`${API_BASE_URL}/health`);

        if (!healthResponse.ok) {
          throw new Error('Health check failed');
        }

        const healthData = await healthResponse.json();

        if (healthData.status === 'ok') {
          setApiStatus('Connected ✓');
        }

        const languagesData = await getLanguages();
        setLanguages(languagesData);
       
      } catch {
        setApiStatus('Connection failed');
        setLanguageStatus('Failed to load');
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

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  statusCard: {
    width: '100%',
    padding: 20,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
  },
  languagesCard: {
    width: '100%',
    padding: 20,
    borderWidth: 1,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  languageItem: {
    marginTop: 16,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
  },
  languageDescription: {
    fontSize: 14,
    marginTop: 4,
  },
});