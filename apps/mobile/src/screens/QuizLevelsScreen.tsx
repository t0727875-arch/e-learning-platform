import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLanguage, getLocalizedText } from '../contexts/LanguageContext';
import { quizzesApi, coursesApi } from '../services/api';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../contexts/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'QuizLevels'>;

interface QuizLevel {
  id: string;
  titleEn: string;
  titleAr?: string;
  titleFr?: string;
  quizLevel: number;
  isLevel0: boolean;
  passingScore: number;
}

export default function QuizLevelsScreen() {
  const { language } = useLanguage();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { user } = useAuth();
  const { courseId } = route.params;

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesApi.getById(courseId),
  });

  const { data: level0Quizzes, isLoading: level0Loading, refetch: refetchLevel0 } = useQuery({
    queryKey: ['quizzes', 'level0'],
    queryFn: quizzesApi.getLevel0,
  });

  const { data: quizLevels, isLoading: levelsLoading, refetch: refetchLevels } = useQuery({
    queryKey: ['quizLevels', courseId],
    queryFn: () => quizzesApi.getLevelsByCourse(courseId),
  });

  const isLoading = level0Loading || levelsLoading;

  const onRefresh = async () => {
    await Promise.all([refetchLevel0(), refetchLevels()]);
  };

  const handleQuizPress = (quiz: QuizLevel) => {
    navigation.navigate('Quiz', {
      quizId: quiz.id,
      courseId,
      type: quiz.isLevel0 ? 'course' : 'course',
    });
  };

  const courseLevel0Quizzes = (level0Quizzes || []).filter((q: any) => !q.courseId || q.courseId === courseId);
  
  const allQuizzes: QuizLevel[] = [
    ...courseLevel0Quizzes.map((q: any) => ({ ...q, quizLevel: 0, isLevel0: true })),
    ...(quizLevels || []).filter((q: QuizLevel) => !q.isLevel0),
  ].sort((a, b) => (a.quizLevel || 0) - (b.quizLevel || 0));

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quiz Levels</Text>
        <Text style={styles.headerSubtitle}>
          {course ? getLocalizedText(course, language) : 'Course'}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
      >
        <View style={styles.infoCard}>
          <Text style={styles.infoEmoji}>💡</Text>
          <Text style={styles.infoText}>
            Level 0 contains general knowledge questions you can try before completing the lessons!
          </Text>
        </View>

        {allQuizzes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyText}>No quizzes available yet</Text>
            <Text style={styles.emptySubtext}>Complete some lessons first</Text>
          </View>
        ) : (
          allQuizzes.map((quiz: QuizLevel, index: number) => (
            <TouchableOpacity
              key={quiz.id}
              style={[
                styles.levelCard,
                quiz.isLevel0 && styles.level0Card,
              ]}
              onPress={() => handleQuizPress(quiz)}
            >
              <View style={[styles.levelBadge, quiz.isLevel0 && styles.level0Badge]}>
                <Text style={styles.levelNumber}>
                  {quiz.isLevel0 ? '0' : quiz.quizLevel || index}
                </Text>
              </View>
              <View style={styles.levelContent}>
                <Text style={styles.levelTitle}>
                  {quiz.isLevel0 ? 'General Knowledge' : getLocalizedText(quiz, language) || `Level ${quiz.quizLevel || index}`}
                </Text>
                <Text style={styles.levelSubtitle}>
                  {quiz.isLevel0 ? 'Easy questions to get started' : `Pass score: ${quiz.passingScore}%`}
                </Text>
              </View>
              <Text style={styles.levelArrow}>→</Text>
            </TouchableOpacity>
          ))
        )}


        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#0f766e',
    padding: 24,
    paddingTop: 48,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#99f6e4',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
  },
  levelCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  level0Card: {
    backgroundColor: '#f0fdfa',
    borderWidth: 2,
    borderColor: '#14b8a6',
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0f766e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  level0Badge: {
    backgroundColor: '#14b8a6',
  },
  levelNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  levelContent: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  levelSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  levelArrow: {
    fontSize: 24,
    color: '#0f766e',
  },
  guestNotice: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  guestText: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
  },
});
