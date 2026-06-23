import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import api from '../services/api';

export default function AnalyticsScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Reusing the surveys endpoint to get a summary
      const res = await api.get('/surveys');
      if (res.data.success) {
        const surveys = res.data.data || [];
        setStats({
          totalSurveys: surveys.length,
          published: surveys.filter(s => s.status === 'published').length,
          drafts: surveys.filter(s => s.status === 'draft').length,
          totalResponses: surveys.reduce((acc, s) => acc + (s.response_count || 0), 0)
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Analytics Overview</Text>

      <View style={styles.grid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Surveys</Text>
          <Text style={styles.statValue}>{stats?.totalSurveys || 0}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Responses</Text>
          <Text style={styles.statValue}>{stats?.totalResponses || 0}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Published</Text>
          <Text style={styles.statValue}>{stats?.published || 0}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Drafts</Text>
          <Text style={styles.statValue}>{stats?.drafts || 0}</Text>
        </View>
      </View>

      <View style={styles.chartPlaceholder}>
        <Text style={styles.chartTitle}>Recent Activity</Text>
        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>Data visualization is synced with the Survexa web dashboard.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
    marginTop: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    width: (Dimensions.get('window').width - 60) / 2,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  chartPlaceholder: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginTop: 10,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  placeholderBox: {
    height: 150,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    padding: 20,
  },
  placeholderText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
  }
});
