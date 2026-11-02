import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  Explore: undefined;
  Progress: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList> | undefined;

  Units: {
    levelId: string;
    levelName: string;
  };

  Lessons: {
    unitId: string;
    unitName: string;
  };

  Lesson: {
    unitId: string;
    lessonId: string;
    lessonName: string;
  };
};