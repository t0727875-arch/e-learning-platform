import React, { useState } from 'react';
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
import { useLanguage, getLocalizedText } from '../contexts/LanguageContext';
import { pathsApi, coursesApi, enrollmentsApi } from '../services/api';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { Path, Course, Enrollment } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type ViewMode = 'courses' | 'paths';

export default function CoursesScreen() {
  const { language } = useLanguage();
  const navigation = useNavigation<NavigationProp>();
  const [viewMode, setViewMode] = useState<ViewMode>('courses');
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const { data: paths, isLoading: pathsLoading, refetch: refetchPaths } = useQuery({
    queryKey: ['paths'],
    queryFn: pathsApi.getAll,
  });

  const { data: courses, isLoading: coursesLoading, refetch: refetchCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: coursesApi.getAll,
  });

  const { data: enrollments, refetch: refetchEnrollments } = useQuery({
    queryKey: ['enrollments'],
    queryFn: enrollmentsApi.getMine,
  });

  const isLoading = pathsLoading || coursesLoading;

  const onRefresh = async () => {
    await Promise.all([refetchPaths(), refetchCourses(), refetchEnrollments()]);
  };

  const filteredCourses = selectedPath
    ? courses?.filter((c: Course) => c.pathId === selectedPath)
    : courses;

  const isEnrolled = (courseId: string) => {
    return enrollments?.some((e: Enrollment) => e.courseId === courseId);
  };

  const getPathCourseCount = (pathId: string) => {
    return courses?.filter((c: Course) => c.pathId === pathId).length || 0;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, viewMode === 'courses' && styles.tabActive]}
          onPress={() => {
            setViewMode('courses');
            setSelectedPath(null);
          }}
        >
          <Text style={[styles.tabText, viewMode === 'courses' && styles.tabTextActive]}>
            📚 All Courses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, viewMode === 'paths' && styles.tabActive]}
          onPress={() => setViewMode('paths')}
        >
          <Text style={[styles.tabText, viewMode === 'paths' && styles.tabTextActive]}>
            🛤️ Learning Paths
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'courses' && (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.pathsScroll}
            contentContainerStyle={styles.pathsContainer}
          >
            <TouchableOpacity
              style={[styles.pathChip, !selectedPath && styles.pathChipActive]}
              onPress={() => setSelectedPath(null)}
            >
              <Text style={[styles.pathChipText, !selectedPath && styles.pathChipTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {paths?.map((path: Path) => (
              <TouchableOpacity
                key={path.id}
                style={[styles.pathChip, selectedPath === path.id && styles.pathChipActive]}
                onPress={() => setSelectedPath(path.id)}
              >
                <Text style={[styles.pathChipText, selectedPath === path.id && styles.pathChipTextActive]}>
                  {getLocalizedText(path, language)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView
            style={styles.contentContainer}
            refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
          >
            {filteredCourses?.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📚</Text>
                <Text style={styles.emptyText}>No courses available</Text>
              </View>
            ) : (
              filteredCourses?.map((course: Course) => (
                <TouchableOpacity
                  key={course.id}
                  style={styles.courseCard}
                  onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
                >
                  <View style={styles.courseHeader}>
                    <View style={styles.courseIcon}>
                      <Text style={styles.courseEmoji}>📖</Text>
                    </View>
                    {isEnrolled(course.id) && (
                      <View style={styles.enrolledBadge}>
                        <Text style={styles.enrolledText}>Enrolled</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.courseTitle}>
                    {getLocalizedText(course, language)}
                  </Text>
                  <Text style={styles.courseDescription} numberOfLines={2}>
                    {getLocalizedText(course, language, 'description') || 'Start your learning journey'}
                  </Text>
                  <View style={styles.courseFooter}>
                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
                    >
                      <Text style={styles.viewButtonText}>
                        {isEnrolled(course.id) ? 'Continue' : 'View Course'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </>
      )}

      {viewMode === 'paths' && (
        <ScrollView
          style={styles.contentContainer}
          refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
        >
          {paths?.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🛤️</Text>
              <Text style={styles.emptyText}>No learning paths available</Text>
            </View>
          ) : (
            paths?.map((path: Path) => (
              <TouchableOpacity
                key={path.id}
                style={styles.pathCard}
                onPress={() => {
                  setViewMode('courses');
                  setSelectedPath(path.id);
                }}
              >
                <View style={styles.pathCardIcon}>
                  <Text style={styles.pathCardEmoji}>🛤️</Text>
                </View>
                <View style={styles.pathCardContent}>
                  <Text style={styles.pathCardTitle}>
                    {getLocalizedText(path, language)}
                  </Text>
                  <Text style={styles.pathCardDescription} numberOfLines={2}>
                    {getLocalizedText(path, language, 'description') || 'Explore this learning path'}
                  </Text>
                  <View style={styles.pathCardStats}>
                    <Text style={styles.pathCardStat}>
                      📚 {getPathCourseCount(path.id)} courses
                    </Text>
                  </View>
                </View>
                <Text style={styles.pathCardArrow}>→</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#0f766e',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#fff',
  },
  pathsScroll: {
    maxHeight: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  pathsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  pathChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  pathChipActive: {
    backgroundColor: '#0f766e',
  },
  pathChipText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  pathChipTextActive: {
    color: '#fff',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
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
    fontSize: 16,
    color: '#64748b',
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  courseIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0fdfa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseEmoji: {
    fontSize: 24,
  },
  enrolledBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  enrolledText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  viewButton: {
    backgroundColor: '#0f766e',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  pathCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  pathCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  pathCardEmoji: {
    fontSize: 28,
  },
  pathCardContent: {
    flex: 1,
  },
  pathCardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  pathCardDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 8,
  },
  pathCardStats: {
    flexDirection: 'row',
    gap: 12,
  },
  pathCardStat: {
    fontSize: 13,
    color: '#0f766e',
    fontWeight: '500',
  },
  pathCardArrow: {
    fontSize: 24,
    color: '#0f766e',
  },
});
