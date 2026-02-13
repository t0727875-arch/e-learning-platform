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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage, getLocalizedText } from '../contexts/LanguageContext';
import { pathsApi, enrollmentsApi, progressApi, coursesApi, contentApi, streakApi, leaderboardApi } from '../services/api';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { Path, Enrollment, Course, ContentNode } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface LessonWithChapters extends ContentNode {
  chapters: (ContentNode & { contents: ContentNode[] })[];
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigation = useNavigation<NavigationProp>();

  const { data: paths, isLoading: pathsLoading, refetch: refetchPaths } = useQuery({
    queryKey: ['paths'],
    queryFn: pathsApi.getAll,
  });

  const { data: enrollments, isLoading: enrollmentsLoading, refetch: refetchEnrollments } = useQuery({
    queryKey: ['enrollments'],
    queryFn: enrollmentsApi.getMine,
  });

  const { data: allProgress, refetch: refetchProgress } = useQuery({
    queryKey: ['progress'],
    queryFn: progressApi.getMine,
  });

  const { data: courses, refetch: refetchCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: coursesApi.getAll,
  });

  const { data: streak, refetch: refetchStreak } = useQuery({
    queryKey: ['streak'],
    queryFn: streakApi.get,
  });

  const { data: leaderboard, refetch: refetchLeaderboard } = useQuery({
    queryKey: ['leaderboard', 'global', 5],
    queryFn: () => leaderboardApi.getGlobal(5),
  });

  const inProgressEnrollment = enrollments?.find((e: Enrollment) => !e.completedAt && e.courseId);
  const inProgressCourse = inProgressEnrollment && courses?.find((c: Course) => c.id === inProgressEnrollment.courseId);

  const { data: resumeHierarchy } = useQuery<LessonWithChapters[]>({
    queryKey: ['courseHierarchy', inProgressCourse?.id],
    queryFn: () => contentApi.getHierarchy(inProgressCourse!.id),
    enabled: !!inProgressCourse?.id,
  });

  const getResumePoint = () => {
    if (!resumeHierarchy || !allProgress) return null;
    for (const lesson of resumeHierarchy) {
      for (const chapter of lesson.chapters || []) {
        for (const content of chapter.contents || []) {
          const isCompleted = allProgress.some((p: any) => p.contentNodeId === content.id && p.completed);
          if (!isCompleted) {
            return { content, lesson, chapter };
          }
        }
      }
    }
    return null;
  };

  const resumePoint = getResumePoint();

  const isLoading = pathsLoading || enrollmentsLoading;

  const onRefresh = async () => {
    await Promise.all([refetchPaths(), refetchEnrollments(), refetchProgress(), refetchCourses(), refetchStreak(), refetchLeaderboard()]);
  };

  const getEnrollmentCount = () => enrollments?.length || 0;
  const getCompletedCount = () => enrollments?.filter((e: Enrollment) => e.completedAt)?.length || 0;

  const getCourseTitle = (courseId: string) => {
    const course = courses?.find((c: Course) => c.id === courseId);
    if (!course) return 'Course';
    return getLocalizedText(course, language);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
    >
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Assalamu Alaikum,</Text>
        <Text style={styles.userName}>{user?.firstName || user?.username || 'Student'}</Text>
        <Text style={styles.welcomeSubtext}>Continue your Islamic learning journey</Text>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{getEnrollmentCount()}</Text>
          <Text style={styles.statLabel}>Enrolled</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{getCompletedCount()}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{allProgress?.length || 0}</Text>
          <Text style={styles.statLabel}>Steps Done</Text>
        </View>
      </View>

      <View style={styles.streakSection}>
        <View style={styles.streakCard}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <View style={styles.streakInfo}>
            <Text style={styles.streakCount}>{streak?.currentStreak || 0} Day Streak!</Text>
            <Text style={styles.streakSubtext}>Best: {streak?.longestStreak || 0} days</Text>
          </View>
        </View>
      </View>

      {inProgressCourse && resumePoint && (
        <View style={styles.section}>
          <View style={styles.resumeCard}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeLabel}>📚 Resume Learning</Text>
            </View>
            <Text style={styles.resumeCourseTitle}>
              {getLocalizedText(inProgressCourse, language)}
            </Text>
            <Text style={styles.resumeDetail}>
              {getLocalizedText(resumePoint.lesson, language)} — {getLocalizedText(resumePoint.content, language)}
            </Text>
            <TouchableOpacity
              style={styles.resumeButton}
              onPress={() => navigation.navigate('ChapterViewer', { 
                courseId: inProgressCourse.id, 
                contentId: resumePoint.content.id 
              })}
            >
              <Text style={styles.resumeButtonText}>Continue Now →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Learning Paths</Text>
        {paths?.map((path: Path) => (
          <TouchableOpacity
            key={path.id}
            style={styles.pathCard}
            onPress={() => navigation.navigate('PathRoadmap', { pathId: path.id })}
          >
            <View style={styles.pathIcon}>
              <Text style={styles.pathEmoji}>📚</Text>
            </View>
            <View style={styles.pathContent}>
              <Text style={styles.pathTitle}>
                {getLocalizedText(path, language)}
              </Text>
              <Text style={styles.pathDescription} numberOfLines={2}>
                {getLocalizedText(path, language, 'description') || 'Explore this learning path'}
              </Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}
      </View>

      {enrollments && enrollments.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Courses</Text>
          {enrollments.slice(0, 5).map((enrollment: Enrollment) => (
            <TouchableOpacity
              key={enrollment.id}
              style={styles.enrollmentCard}
              onPress={() => navigation.navigate('CourseDetail', { courseId: enrollment.courseId })}
            >
              <View style={styles.enrollmentContent}>
                <Text style={styles.enrollmentTitle}>{getCourseTitle(enrollment.courseId)}</Text>
                {enrollment.completedAt ? (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedText}>✓ Completed</Text>
                  </View>
                ) : (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: '30%' }]} />
                    </View>
                    <Text style={styles.progressText}>In Progress</Text>
                  </View>
                )}
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {leaderboard && leaderboard.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Leaderboard</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Leaderboard')}>
              <Text style={styles.viewAllLink}>View All →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.leaderboardCard}>
            {leaderboard.slice(0, 5).map((entry: any, index: number) => (
              <View key={entry.userId || index} style={styles.leaderboardRow}>
                <Text style={styles.leaderboardRank}>{index + 1}</Text>
                <Text style={styles.leaderboardName}>{entry.name || `Student ${index + 1}`}</Text>
                <Text style={styles.leaderboardPoints}>{entry.points} pts</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={{ height: 40 }} />
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
  welcomeSection: {
    backgroundColor: '#0f766e',
    padding: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  welcomeText: {
    color: '#99f6e4',
    fontSize: 16,
  },
  userName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  welcomeSubtext: {
    color: '#99f6e4',
    fontSize: 14,
    marginTop: 8,
  },
  statsSection: {
    flexDirection: 'row',
    marginTop: -20,
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f766e',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  resumeCard: {
    backgroundColor: '#0f766e',
    borderRadius: 16,
    padding: 20,
  },
  resumeHeader: {
    marginBottom: 8,
  },
  resumeLabel: {
    color: '#99f6e4',
    fontSize: 14,
    fontWeight: '600',
  },
  resumeCourseTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resumeDetail: {
    color: '#99f6e4',
    fontSize: 14,
    marginBottom: 16,
  },
  resumeButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  resumeButtonText: {
    color: '#0f766e',
    fontSize: 16,
    fontWeight: '600',
  },
  pathCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  pathIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0fdfa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pathEmoji: {
    fontSize: 24,
  },
  pathContent: {
    flex: 1,
    marginLeft: 12,
  },
  pathTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  pathDescription: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  arrow: {
    fontSize: 20,
    color: '#0f766e',
  },
  enrollmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  enrollmentContent: {
    flex: 1,
  },
  enrollmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    maxWidth: 100,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0f766e',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
  },
  completedBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  completedText: {
    color: '#16a34a',
    fontSize: 12,
    fontWeight: '600',
  },
  enrollmentText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  streakSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  streakCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  streakInfo: {
    flex: 1,
  },
  streakCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400e',
  },
  streakSubtext: {
    fontSize: 14,
    color: '#b45309',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllLink: {
    fontSize: 14,
    color: '#0f766e',
    fontWeight: '500',
  },
  leaderboardCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  leaderboardRank: {
    width: 28,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f766e',
  },
  leaderboardName: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
  },
  leaderboardPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
});
