import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View, Text } from 'react-native';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import CoursesScreen from '../screens/CoursesScreen';
import CourseDetailScreen from '../screens/CourseDetailScreen';
import ChapterViewerScreen from '../screens/ChapterViewerScreen';
import QuizScreen from '../screens/QuizScreen';
import CertificatesScreen from '../screens/CertificatesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import QuizLevelsScreen from '../screens/QuizLevelsScreen';
import PathRoadmapScreen from '../screens/PathRoadmapScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  CourseDetail: { courseId: string };
  ChapterViewer: { contentId: string; courseId: string; chapterId?: string; lessonId?: string };
  Quiz: { quizId: string; lessonId?: string; courseId?: string; type: 'lesson' | 'course' };
  Leaderboard: undefined;
  QuizLevels: { courseId: string };
  PathRoadmap: { pathId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Courses: undefined;
  Leaderboard: undefined;
  Certificates: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const iconMap: Record<string, string> = {
    Home: '🏠',
    Courses: '📚',
    Leaderboard: '🏆',
    Certificates: '🎓',
    Profile: '👤',
  };
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
      {iconMap[name] || '📄'}
    </Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: '#0f766e',
        tabBarInactiveTintColor: '#64748b',
        headerStyle: {
          backgroundColor: '#0f766e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Courses" component={CoursesScreen} options={{ title: 'Courses' }} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} options={{ title: 'Leaderboard' }} />
      <Tab.Screen name="Certificates" component={CertificatesScreen} options={{ title: 'Certificates' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={{ marginTop: 16, color: '#64748b' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0f766e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Auth"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CourseDetail"
          component={CourseDetailScreen}
          options={{ title: 'Course' }}
        />
        <Stack.Screen
          name="ChapterViewer"
          component={ChapterViewerScreen}
          options={{ title: 'Chapter' }}
        />
        <Stack.Screen
          name="Quiz"
          component={QuizScreen}
          options={{ title: 'Quiz' }}
        />
        <Stack.Screen
          name="Leaderboard"
          component={LeaderboardScreen}
          options={{ title: 'Leaderboard' }}
        />
        <Stack.Screen
          name="QuizLevels"
          component={QuizLevelsScreen}
          options={{ title: 'Quiz Levels' }}
        />
        <Stack.Screen
          name="PathRoadmap"
          component={PathRoadmapScreen}
          options={{ title: 'Learning Path' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
