import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useLanguage, getLocalizedText } from '../contexts/LanguageContext';
import { certificatesApi, coursesApi } from '../services/api';
import type { Certificate, Course } from '../types';

export default function CertificatesScreen() {
  const { language } = useLanguage();

  const { data: certificates, isLoading, refetch } = useQuery({
    queryKey: ['certificates'],
    queryFn: certificatesApi.getMine,
  });

  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: coursesApi.getAll,
  });

  const getCourse = (courseId: string): Course | undefined => {
    return courses?.find((c: Course) => c.id === courseId);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
      refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🎓</Text>
        <Text style={styles.headerTitle}>Your Certificates</Text>
        <Text style={styles.headerSubtitle}>
          Achievements from your learning journey
        </Text>
      </View>

      {!certificates || certificates.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📜</Text>
          <Text style={styles.emptyTitle}>No Certificates Yet</Text>
          <Text style={styles.emptyText}>
            Complete courses to earn certificates and showcase your achievements
          </Text>
        </View>
      ) : (
        <View style={styles.certificatesContainer}>
          {certificates.map((certificate: Certificate) => {
            const course = getCourse(certificate.courseId);
            
            return (
              <View key={certificate.id} style={styles.certificateCard}>
                <View style={styles.certificateHeader}>
                  <View style={styles.certificateBadge}>
                    <Text style={styles.badgeEmoji}>🏆</Text>
                  </View>
                  <View style={styles.earnedBadge}>
                    <Text style={styles.earnedText}>Earned</Text>
                  </View>
                </View>

                <Text style={styles.certificateTitle}>
                  Certificate of Completion
                </Text>
                
                <Text style={styles.courseName}>
                  {course ? getLocalizedText(course, language) : 'Course'}
                </Text>

                <View style={styles.certificateDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Issued</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(certificate.issuedAt)}
                    </Text>
                  </View>
                </View>

                <View style={styles.certificatePreview}>
                  <View style={styles.previewBorder}>
                    <Text style={styles.previewText}>
                      CERTIFICATE OF COMPLETION
                    </Text>
                    <Text style={styles.previewCourse}>
                      {course ? getLocalizedText(course, language) : 'Course'}
                    </Text>
                    <Text style={styles.previewSeal}>🌙</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
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
  header: {
    backgroundColor: '#0f766e',
    padding: 24,
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#99f6e4',
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  certificatesContainer: {
    padding: 16,
  },
  certificateCard: {
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
  certificateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  certificateBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeEmoji: {
    fontSize: 24,
  },
  earnedBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  earnedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
  },
  certificateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  courseName: {
    fontSize: 16,
    color: '#0f766e',
    marginBottom: 16,
  },
  certificateDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  certificatePreview: {
    backgroundColor: '#fef9f0',
    borderRadius: 12,
    padding: 20,
  },
  previewBorder: {
    borderWidth: 2,
    borderColor: '#d4a853',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  previewText: {
    fontSize: 10,
    letterSpacing: 2,
    color: '#92400e',
    marginBottom: 8,
  },
  previewCourse: {
    fontSize: 14,
    fontWeight: '600',
    color: '#78350f',
    textAlign: 'center',
    marginBottom: 8,
  },
  previewSeal: {
    fontSize: 24,
  },
});
