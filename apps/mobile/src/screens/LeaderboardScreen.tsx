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
import { leaderboardApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

type LeaderboardTab = 'global' | 'country' | 'weekly';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  points: number;
  country?: string;
  isCurrentUser?: boolean;
}

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('global');

  const { data: globalData, isLoading: globalLoading, refetch: refetchGlobal } = useQuery({
    queryKey: ['leaderboard', 'global'],
    queryFn: () => leaderboardApi.getGlobal(100),
    enabled: activeTab === 'global',
  });

  const { data: countryData, isLoading: countryLoading, refetch: refetchCountry } = useQuery({
    queryKey: ['leaderboard', 'country'],
    queryFn: leaderboardApi.getCountry,
    enabled: activeTab === 'country',
  });

  const { data: weeklyData, isLoading: weeklyLoading, refetch: refetchWeekly } = useQuery({
    queryKey: ['leaderboard', 'weekly'],
    queryFn: leaderboardApi.getWeekly,
    enabled: activeTab === 'weekly',
  });

  const getCurrentData = (): LeaderboardEntry[] => {
    switch (activeTab) {
      case 'global':
        return globalData || [];
      case 'country':
        return countryData || [];
      case 'weekly':
        return weeklyData || [];
      default:
        return [];
    }
  };

  const isLoading = activeTab === 'global' ? globalLoading : activeTab === 'country' ? countryLoading : weeklyLoading;
  const data = getCurrentData();

  const onRefresh = async () => {
    if (activeTab === 'global') await refetchGlobal();
    if (activeTab === 'country') await refetchCountry();
    if (activeTab === 'weekly') await refetchWeekly();
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <Text style={styles.headerSubtitle}>Compete with other learners</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'global' && styles.tabActive]}
          onPress={() => setActiveTab('global')}
        >
          <Text style={[styles.tabText, activeTab === 'global' && styles.tabTextActive]}>
            🌍 Global
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'country' && styles.tabActive]}
          onPress={() => setActiveTab('country')}
        >
          <Text style={[styles.tabText, activeTab === 'country' && styles.tabTextActive]}>
            🏠 Country
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'weekly' && styles.tabActive]}
          onPress={() => setActiveTab('weekly')}
        >
          <Text style={[styles.tabText, activeTab === 'weekly' && styles.tabTextActive]}>
            📅 Weekly
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0f766e" />
        </View>
      ) : data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🏆</Text>
          <Text style={styles.emptyText}>No rankings available yet</Text>
          <Text style={styles.emptySubtext}>Start learning to appear on the leaderboard!</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.listContainer}
          refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
        >
          {data.map((entry: LeaderboardEntry, index: number) => (
            <View
              key={entry.userId || index}
              style={[
                styles.entryCard,
                entry.isCurrentUser && styles.currentUserCard,
                index < 3 && styles.topThreeCard,
              ]}
            >
              <View style={styles.rankContainer}>
                <Text style={[styles.rank, index < 3 && styles.topRank]}>
                  {getRankEmoji(entry.rank || index + 1)}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, entry.isCurrentUser && styles.currentUserName]}>
                  {entry.name || `Student ${index + 1}`}
                  {entry.isCurrentUser && ' (You)'}
                </Text>
                {entry.country && (
                  <Text style={styles.userCountry}>{entry.country}</Text>
                )}
              </View>
              <View style={styles.pointsContainer}>
                <Text style={styles.points}>{entry.points}</Text>
                <Text style={styles.pointsLabel}>pts</Text>
              </View>
            </View>
          ))}
          <View style={{ height: 40 }} />
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#0f766e',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#fff',
  },
  tabTextDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyEmoji: {
    fontSize: 64,
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
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  topThreeCard: {
    backgroundColor: '#fefce8',
  },
  currentUserCard: {
    backgroundColor: '#f0fdfa',
    borderWidth: 2,
    borderColor: '#0f766e',
  },
  rankContainer: {
    width: 44,
    alignItems: 'center',
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748b',
  },
  topRank: {
    fontSize: 24,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  currentUserName: {
    color: '#0f766e',
  },
  userCountry: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  points: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f766e',
  },
  pointsLabel: {
    fontSize: 12,
    color: '#64748b',
  },
});
