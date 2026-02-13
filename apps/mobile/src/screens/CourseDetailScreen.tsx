import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLanguage, getLocalizedText } from '../contexts/LanguageContext';
import { coursesApi, contentApi, enrollmentsApi, progressApi, quizzesApi } from '../services/api';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { Course, ContentNode, LessonWithChapters, ChapterWithContent, Enrollment, Progress } from '../types';
import LessonAccordion from '../components/course/LessonAccordion';
import FloatingQuizButton from '../components/FloatingQuizButton';

type RouteProps = RouteProp<RootStackParamList, 'CourseDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CourseDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const { courseId } = route.params;

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesApi.getById(courseId),
  });

  const { data: contentNodes, isLoading: contentLoading } = useQuery({
    queryKey: ['content', courseId],
    queryFn: () => contentApi.getByCourse(courseId),
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', courseId],
    queryFn: () => enrollmentsApi.getByCourse(courseId),
  });

  const { data: progress } = useQuery({
    queryKey: ['progress', courseId],
    queryFn: () => progressApi.getByCourse(courseId),
  });

  const { data: courseQuiz } = useQuery({
    queryKey: ['courseQuiz', courseId],
    queryFn: () => quizzesApi.getByCourse(courseId),
  });

  const enrollMutation = useMutation({
    mutationFn: () => enrollmentsApi.enroll(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment', courseId] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      Alert.alert('Success', 'You have been enrolled in this course!');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to enroll');
    },
  });

  const isEnrolled = !!enrollment;
  const isLoading = courseLoading || contentLoading;

  const buildLessonHierarchy = (): LessonWithChapters[] => {
    if (!contentNodes) return [];
    
    const lessons = contentNodes.filter((n: ContentNode) => n.nodeType === 'lesson');
    const chapters = contentNodes.filter((n: ContentNode) => n.nodeType === 'chapter');
    const contents = contentNodes.filter((n: ContentNode) => n.nodeType === 'content');
    
    return lessons
      .sort((a: ContentNode, b: ContentNode) => a.order - b.order)
      .map((lesson: ContentNode) => {
        const lessonChapters = chapters
          .filter((c: ContentNode) => c.parentId === lesson.id)
          .sort((a: ContentNode, b: ContentNode) => a.order - b.order)
          .map((chapter: ContentNode) => ({
            ...chapter,
            contents: contents
              .filter((ct: ContentNode) => ct.parentId === chapter.id)
              .sort((a: ContentNode, b: ContentNode) => a.order - b.order),
          }));
        return {
          ...lesson,
          chapters: lessonChapters,
        };
      });
  };

  const lessons = buildLessonHierarchy();

  const calculateProgress = (): number => {
    if (!contentNodes || !progress) return 0;
    const totalContents = contentNodes.filter((n: ContentNode) => n.nodeType === 'content').length;
    if (totalContents === 0) return 0;
    const completedCount = progress.filter((p: Progress) => p.completed).length;
    return Math.round((completedCount / totalContents) * 100);
  };

  const progressPercent = calculateProgress();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Course not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.heroSection}>
        <View style={styles.courseIcon}>
          <Text style={styles.courseEmoji}>📖</Text>
        </View>
        <Text style={styles.courseTitle}>
          {getLocalizedText(course, language)}
        </Text>
        <Text style={styles.courseDescription}>
          {getLocalizedText(course, language, 'description')}
        </Text>
      </View>

      {isEnrolled && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Your Progress</Text>
            <Text style={styles.progressPercent}>{progressPercent}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>
      )}

      {course.objectives && course.objectives.length > 0 && (
        <View style={styles.objectivesSection}>
          <Text style={styles.sectionTitle}>What You'll Learn</Text>
          {course.objectives.map((objective: string, index: number) => (
            <View key={index} style={styles.objectiveItem}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.objectiveText}>{objective}</Text>
            </View>
          ))}
        </View>
      )}

      {!isEnrolled && (
        <View style={styles.enrollSection}>
          <TouchableOpacity
            style={styles.enrollButton}
            onPress={() => enrollMutation.mutate()}
            disabled={enrollMutation.isPending}
          >
            {enrollMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.enrollButtonText}>Enroll in Course</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.lessonsSection}>
        <Text style={styles.sectionTitle}>Course Content</Text>
        <Text style={styles.lessonsCount}>
          {lessons.length} Lessons • {contentNodes?.filter((n: ContentNode) => n.nodeType === 'chapter').length || 0} Chapters
        </Text>
        
        <LessonAccordion
          lessons={lessons}
          courseId={courseId}
          progress={progress || []}
          isEnrolled={isEnrolled}
        />
      </View>

      {isEnrolled && courseQuiz && progressPercent >= 80 && (
        <View style={styles.finalQuizSection}>
          <Text style={styles.sectionTitle}>Final Course Quiz</Text>
          <Text style={styles.quizDescription}>
            Complete the final quiz to earn your certificate
          </Text>
          <TouchableOpacity
            style={styles.quizButton}
            onPress={() => navigation.navigate('Quiz', {
              quizId: courseQuiz.id,
              courseId,
              type: 'course',
            })}
          >
            <Text style={styles.quizButtonText}>Take Final Quiz</Text>
          </TouchableOpacity>
        </View>
      )}

      <FloatingQuizButton courseId={courseId} />
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
  },
  heroSection: {
    backgroundColor: '#0f766e',
    padding: 24,
    alignItems: 'center',
  },
  courseIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  courseEmoji: {
    fontSize: 40,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  courseDescription: {
    fontSize: 16,
    color: '#99f6e4',
    textAlign: 'center',
    lineHeight: 24,
  },
  progressSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f766e',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0f766e',
    borderRadius: 4,
  },
  objectivesSection: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  checkmark: {
    fontSize: 16,
    color: '#0f766e',
    marginRight: 8,
    marginTop: 2,
  },
  objectiveText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  enrollSection: {
    padding: 16,
  },
  enrollButton: {
    backgroundColor: '#0f766e',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  enrollButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  lessonsSection: {
    padding: 16,
  },
  lessonsCount: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  finalQuizSection: {
    backgroundColor: '#fef3c7',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  quizDescription: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 12,
  },
  quizButton: {
    backgroundColor: '#d97706',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  quizButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
