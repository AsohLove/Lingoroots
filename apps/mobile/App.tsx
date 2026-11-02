import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import UnitsScreen from './src/screens/UnitsScreen';
import LessonsScreen from './src/screens/LessonsScreen';
import LessonScreen from './src/screens/LessonScreen';
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

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />

      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.forest,
            headerTitleStyle: {
              fontWeight: "700",
            },
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        >
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
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}