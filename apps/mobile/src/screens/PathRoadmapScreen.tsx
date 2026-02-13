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
import { pathsApi, coursesApi } from '../services/api';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { Path, Course } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'PathRoadmap'>;

export default function PathRoadmapScreen() {
  const { language } = useLanguage();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { pathId } = route.params;

  const { data: path, isLoading: pathLoading, refetch: refetchPath } = useQuery({
    queryKey: ['path', pathId],
    queryFn: () => pathsApi.getById(pathId),
  });

  const { data: courses, isLoading: coursesLoading, refetch: refetchCourses } = useQuery({
    queryKey: ['courses', 'path', pathId],
    queryFn: async () => {
      const allCourses = await coursesApi.getAll();
      return allCourses.filter((c: Course) => c.pathId === pathId);
    },
  });

  const isLoading = pathLoading || coursesLoading;

  const onRefresh = async () => {
    await Promise.all([refetchPath(), refetchCourses()]);
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {path ? getLocalizedText(path, language) : 'Learning Path'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {path ? getLocalizedText(path, language, 'description') : 'Explore this learning path'}
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{courses?.length || 0}</Text>
            <Text style={styles.statLabel}>Courses</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
      >
        <View style={styles.roadmapContainer}>
          {courses && courses.length > 0 ? (
            courses.map((course: Course, index: number) => (
              <View key={course.id} style={styles.roadmapItem}>
                <View style={styles.roadmapLine}>
                  <View style={styles.roadmapDot} />
                  {index < courses.length - 1 && <View style={styles.roadmapConnector} />}
                </View>
                <TouchableOpacity
                  style={styles.courseCard}
                  onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
                >
                  <View style={styles.courseNumber}>
                    <Text style={styles.courseNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.courseContent}>
                    <Text style={styles.courseTitle}>
                      {getLocalizedText(course, language)}
                    </Text>
                    <Text style={styles.courseDescription} numberOfLines={2}>
                      {getLocalizedText(course, language, 'description') || 'Explore this course'}
                    </Text>
                  </View>
                  <Text style={styles.arrow}>→</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📚</Text>
              <Text style={styles.emptyText}>No courses in this path yet</Text>
              <Text style={styles.emptySubtext}>Check back soon for new content!</Text>
            </View>
          )}
        </View>

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
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#99f6e4',
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 24,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#99f6e4',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  roadmapContainer: {
    paddingLeft: 8,
  },
  roadmapItem: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  roadmapLine: {
    width: 32,
    alignItems: 'center',
  },
  roadmapDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0f766e',
    marginTop: 20,
  },
  roadmapConnector: {
    width: 3,
    flex: 1,
    backgroundColor: '#14b8a6',
    marginTop: 4,
    marginBottom: -16,
  },
  courseCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginLeft: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  courseNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0fdfa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  courseNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f766e',
  },
  courseContent: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  courseDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  arrow: {
    fontSize: 20,
    color: '#0f766e',
    marginLeft: 8,
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
});
