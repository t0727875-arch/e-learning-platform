import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { enrollmentsApi, progressApi, certificatesApi } from '../services/api';
import type { Enrollment, Certificate } from '../types';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();

  const { data: enrollments } = useQuery({
    queryKey: ['enrollments'],
    queryFn: enrollmentsApi.getMine,
  });

  const { data: progress } = useQuery({
    queryKey: ['progress'],
    queryFn: progressApi.getMine,
  });

  const { data: certificates } = useQuery({
    queryKey: ['certificates'],
    queryFn: certificatesApi.getMine,
  });

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: async () => await logout() },
      ]
    );
  };

  const stats = {
    enrolled: enrollments?.length || 0,
    completed: enrollments?.filter((e: Enrollment) => e.completedAt)?.length || 0,
    certificates: certificates?.length || 0,
    progress: progress?.length || 0,
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.firstName?.[0] || user?.username?.[0] || '?'}
          </Text>
        </View>
        <Text style={styles.userName}>
          {user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : user?.username}
        </Text>
        <Text style={styles.userRole}>{user?.role || 'Student'}</Text>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.enrolled}</Text>
          <Text style={styles.statLabel}>Enrolled</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.certificates}</Text>
          <Text style={styles.statLabel}>Certificates</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language</Text>
        <View style={styles.languageOptions}>
          {[
            { code: 'en', label: 'English', flag: '🇬🇧' },
            { code: 'ar', label: 'العربية', flag: '🇸🇦' },
            { code: 'fr', label: 'Français', flag: '🇫🇷' },
          ].map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageButton,
                language === lang.code && styles.languageButtonActive,
              ]}
              onPress={() => setLanguage(lang.code as 'en' | 'ar' | 'fr')}
            >
              <Text style={styles.languageFlag}>{lang.flag}</Text>
              <Text style={[
                styles.languageLabel,
                language === lang.code && styles.languageLabelActive,
              ]}>
                {lang.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <View style={styles.accountItem}>
          <Text style={styles.accountLabel}>Username</Text>
          <Text style={styles.accountValue}>{user?.username}</Text>
        </View>

        {user?.email && (
          <View style={styles.accountItem}>
            <Text style={styles.accountLabel}>Email</Text>
            <Text style={styles.accountValue}>{user.email}</Text>
          </View>
        )}

        <View style={styles.accountItem}>
          <Text style={styles.accountLabel}>Role</Text>
          <Text style={styles.accountValue}>
            {user?.role === 'admin' ? 'Administrator' :
             user?.role === 'teacher' ? 'Teacher' : 'Student'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.aboutItem}>
          <Text style={styles.aboutEmoji}>🌙</Text>
          <View style={styles.aboutContent}>
            <Text style={styles.aboutTitle}>Noor Academy</Text>
            <Text style={styles.aboutDescription}>
              Islamic E-Learning Platform
            </Text>
          </View>
        </View>
        
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#0f766e',
    alignItems: 'center',
    padding: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#99f6e4',
    textTransform: 'capitalize',
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
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
  statDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  languageOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  languageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    gap: 8,
  },
  languageButtonActive: {
    backgroundColor: '#f0fdfa',
    borderWidth: 1,
    borderColor: '#0f766e',
  },
  languageFlag: {
    fontSize: 20,
  },
  languageLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  languageLabelActive: {
    color: '#0f766e',
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  accountLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  accountValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  aboutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aboutEmoji: {
    fontSize: 32,
  },
  aboutContent: {
    flex: 1,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  aboutDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  versionText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 12,
    textAlign: 'center',
  },
  logoutButton: {
    margin: 16,
    marginBottom: 32,
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
});
