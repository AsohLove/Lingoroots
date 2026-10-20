import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { API_BASE_URL } from './src/config/api';

export default function App() {
  const [apiStatus, setApiStatus] = useState('Checking...');

  useEffect(() => {
    async function checkApi() {
      try {
        const response = await fetch(`${API_BASE_URL}/health`);

        if (!response.ok) {
          throw new Error('API request failed');
        }

        const data = await response.json();

        if (data.status === 'ok') {
          setApiStatus('Connected ✓');
        } else {
          setApiStatus('Unexpected API response');
        }
      } catch {
        setApiStatus('Connection failed');
      }
    }

    checkApi();
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

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
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
    textAlign: 'center',
    marginBottom: 32,
  },

  statusCard: {
    width: '100%',
    padding: 20,
    borderWidth: 1,
    borderRadius: 12,
  },

  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },

  statusText: {
    fontSize: 16,
  },
});