
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './src/screens/HomeScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import UnitsScreen from './src/screens/UnitsScreen';
import LessonsScreen from './src/screens/LessonsScreen';
import LessonScreen from './src/screens/LessonScreen';

import {
  LoginScreen,
  PublicHomeScreen,
  RegisterScreen,
  VerifyEmailScreen,
} from './src/screens/AuthScreens';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import type {
  RootStackParamList,
  TabParamList,
} from './src/navigation/types';

import { colors } from './src/theme/colors';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const icons: Record<keyof TabParamList, string> = {
  Home: '⌂',
  Explore: '⌕',
  Progress: '↗',
  Profile: '○',
};

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.forest,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 3,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingTop: 8,
        },
        tabBarIcon: ({ focused, color }) => (
          <Text
            style={{
              color,
              fontSize: focused ? 25 : 23,
              fontWeight: focused ? '800' : '400',
            }}
          >
            {icons[route.name]}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.forest} />
        <Text style={styles.loadingText}>Loading LingoRoots…</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        key={isAuthenticated ? 'authenticated' : 'public'}
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.forest,
          headerTitleStyle: {
            fontWeight: '700',
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="Units"
              component={UnitsScreen}
              options={({ route }) => ({
                title: route.params.levelName,
              })}
            />

            <Stack.Screen
              name="Lessons"
              component={LessonsScreen}
              options={({ route }) => ({
                title: route.params.unitName,
              })}
            />

            <Stack.Screen
              name="Lesson"
              component={LessonScreen}
              options={({ route }) => ({
                title: route.params.lessonName,
              })}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="PublicHome"
              component={PublicHomeScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: 'Sign in' }}
            />

            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Create account' }}
            />

            <Stack.Screen
              name="VerifyEmail"
              component={VerifyEmailScreen}
              options={{ title: 'Verify email' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.muted,
    marginTop: 14,
    fontSize: 14,
  },
});
