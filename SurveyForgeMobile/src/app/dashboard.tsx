import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Alert,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';

const { width } = Dimensions.get('window');

// Gradient palettes
const GRADIENTS = {
  surveys: ['#EBEBFF', '#D6D6FF'],
  responses: ['#D1FAE5', '#CCFBF1'],
  questions: ['#FFEDD5', '#FCE7F3'],
  active: ['#CFFAFE', '#EBEBFF'],
  create: ['#e879f9', '#4f46e5'],
  ai: ['#a78bfa', '#4f46e5'],
  builder: ['#60a5fa', '#06b6d4'],
  templates: ['#34d399', '#0d9488'],
  distrib: ['#818cf8', '#4f46e5'],
  analytics: ['#fbbf24', '#f97316'],
  whatsnew: ['#fb7185', '#db2777'],
};

function getTimeAgo(dateStr: string) {
  if (!dateStr) return '—';
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function DashboardScreen() {
  const router = useRouter();
  const [surveys, setSurveys] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [sysStatus, setSysStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [survRes, hlthRes, actRes] = await Promise.all([
        api.get('/surveys'),
        api.get('/health').catch(() => null),
        api.get('/activity').catch(() => null)
      ]);
      setSurveys(survRes.data?.data || []);
      if (hlthRes?.data?.config) setSysStatus(hlthRes.data.config);
      if (actRes?.data?.data) setActivities(actRes.data.data.slice(0, 5));
    } catch (error: any) {
      console.log('Dashboard fetch error', error);
      Alert.alert('Error', 'Could not load all dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  const totalSurveys = surveys.length;
  const totalResponses = surveys.reduce((s, x) => s + (x.response_count || 0), 0);
  const totalQuestions = surveys.reduce((s, x) => s + (x.question_count || 0), 0);
  const activeSurveys = surveys.filter((s) => (s.question_count || 0) > 0).length;

  const recentSurveys = [...surveys]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? '🌤 Good morning' : hour < 17 ? '☀️ Good afternoon' : '🌙 Good evening';

  return (
    <ScrollView 
      style={styles.container} 
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4f46e5']} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{greeting}, User</Text>
          <Text style={styles.headerSub}>
            {totalSurveys > 0
              ? `You have ${totalSurveys} surveys with ${totalResponses} responses.`
              : 'Welcome! Create your first survey to get started.'}
          </Text>
        </View>
        <TouchableOpacity style={styles.newBtn} onPress={() => router.push('/(app)/explore')}>
          <Text style={styles.newBtnText}>＋ New</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Grid (Horizontal Scroll) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
        <StatCard icon="📋" label="Total Surveys" value={totalSurveys} colors={GRADIENTS.surveys} />
        <StatCard icon="💬" label="Total Responses" value={totalResponses} colors={GRADIENTS.responses} />
        <StatCard icon="❓" label="Total Questions" value={totalQuestions} colors={GRADIENTS.questions} />
        <StatCard icon="✅" label="Active Surveys" value={activeSurveys} colors={GRADIENTS.active} />
      </ScrollView>

      {/* Recent Surveys */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Surveys</Text>
          <Text style={styles.sectionLink}>View all →</Text>
        </View>
        <View style={styles.card}>
          {recentSurveys.length === 0 ? (
            <Text style={styles.emptyText}>No surveys yet.</Text>
          ) : (
            recentSurveys.map((s, idx) => (
              <View key={s.id} style={[styles.row, idx !== recentSurveys.length - 1 && styles.borderBottom]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle} numberOfLines={1}>{s.title}</Text>
                  <Text style={styles.rowSub}>{getTimeAgo(s.created_at)}</Text>
                </View>
                <View style={styles.rowRight}>
                  <Text style={styles.rowVal}>{s.response_count || 0} res</Text>
                  <View style={[styles.badge, (s.question_count || 0) > 0 ? styles.badgeActive : styles.badgeDraft]}>
                    <Text style={[styles.badgeText, (s.question_count || 0) > 0 ? styles.badgeTextActive : styles.badgeTextDraft]}>
                      {(s.question_count || 0) > 0 ? 'Active' : 'Draft'}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </View>

      {/* System Status & Quick Numbers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Status</Text>
        <View style={styles.card}>
          <StatusRow label="Backend API" ok={true} detail="Connected" />
          <StatusRow label="Database" ok={true} detail="Ready" />
          <StatusRow label="OpenAI GPT-4" ok={sysStatus?.openai} detail={sysStatus?.openai ? 'Configured' : 'Missing'} />
          <StatusRow label="Email (SMTP)" ok={sysStatus?.email} detail={sysStatus?.email ? 'Configured' : 'Missing'} />
          
          <Text style={styles.quickNumsTitle}>QUICK NUMBERS</Text>
          <View style={styles.quickNumsRow}>
            <View style={styles.quickNumBox}>
              <Text style={styles.quickNumVal}>{totalSurveys}</Text>
              <Text style={styles.quickNumLbl}>Surveys</Text>
            </View>
            <View style={styles.quickNumBox}>
              <Text style={styles.quickNumVal}>{totalResponses}</Text>
              <Text style={styles.quickNumLbl}>Responses</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🕒 Recent Activity</Text>
        </View>
        <View style={styles.card}>
          {activities.length === 0 ? (
            <Text style={styles.emptyText}>No activity logged yet.</Text>
          ) : (
            activities.map((act, idx) => (
              <View key={act.id} style={[styles.actRow, idx !== activities.length - 1 && styles.borderBottom]}>
                <Text style={styles.actIcon}>
                  {act.action.includes('login') ? '🔑' : act.action.includes('create') ? '＋' : act.action.includes('edit') ? '✏️' : '⚡'}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actTitle}>{act.action.replace(/_/g, ' ')}</Text>
                  <Text style={styles.actSub} numberOfLines={1}>Target: {act.target || '—'}</Text>
                </View>
                <Text style={styles.actTime}>{getTimeAgo(act.created_at)}</Text>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.grid}>
          <QuickAction icon="✨" label="Create hub" desc="Blank or template" colors={GRADIENTS.create} />
          <QuickAction icon="🤖" label="AI Generator" desc="Generate with GPT-4" colors={GRADIENTS.ai} />
          <QuickAction icon="📊" label="Analytics" desc="Real-time data" colors={GRADIENTS.analytics} />
          <QuickAction icon="📣" label="Distribution" desc="Share & emails" colors={GRADIENTS.distrib} />
        </View>
      </View>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

/* Subcomponents */

function StatCard({ icon, label, value, colors }: any) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <Text style={styles.statLabel}>{label}</Text>
        <LinearGradient colors={colors} style={styles.statIconBox}>
          <Text style={styles.statIcon}>{icon}</Text>
        </LinearGradient>
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function StatusRow({ label, ok, detail }: any) {
  return (
    <View style={[styles.row, styles.borderBottom, { paddingVertical: 12 }]}>
      <View style={styles.statusLeft}>
        <View style={[styles.statusDot, { backgroundColor: ok ? '#34d399' : '#fbbf24' }]} />
        <Text style={styles.statusLabel}>{label}</Text>
      </View>
      <Text style={[styles.statusDetail, { color: ok ? '#059669' : '#d97706' }]}>
        {ok ? '✓ ' : '⚠ '}{detail}
      </Text>
    </View>
  );
}

function QuickAction({ icon, label, desc, colors }: any) {
  return (
    <TouchableOpacity style={styles.actionCard}>
      <LinearGradient colors={colors} style={styles.actionIconBox}>
        <Text style={styles.actionIcon}>{icon}</Text>
      </LinearGradient>
      <View style={{ flex: 1 }}>
        <Text style={styles.actionLabel}>{label}</Text>
        <Text style={styles.actionDesc} numberOfLines={1}>{desc}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20,
    backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6'
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  headerSub: { fontSize: 13, color: '#6b7280', marginTop: 4, paddingRight: 10 },
  newBtn: { backgroundColor: '#4f46e5', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  newBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  
  statsScroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, gap: 12 },
  statCard: {
    backgroundColor: '#fff', width: width * 0.42, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 }, elevation: 1
  },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  statLabel: { fontSize: 13, fontWeight: '600', color: '#6b7280', flex: 1 },
  statIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  statIcon: { fontSize: 18 },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginTop: 12 },

  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  sectionLink: { fontSize: 13, color: '#4f46e5', fontWeight: '600' },
  
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.03, elevation: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  rowTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  rowSub: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  rowRight: { alignItems: 'flex-end' },
  rowVal: { fontSize: 13, fontWeight: 'bold', color: '#374151', marginBottom: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeActive: { backgroundColor: '#d1fae5' },
  badgeDraft: { backgroundColor: '#f3f4f6' },
  badgeText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  badgeTextActive: { color: '#059669' },
  badgeTextDraft: { color: '#6b7280' },
  emptyText: { fontSize: 14, color: '#9ca3af', textAlign: 'center', paddingVertical: 20 },

  statusLeft: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusLabel: { fontSize: 14, fontWeight: '500', color: '#374151' },
  statusDetail: { fontSize: 13, fontWeight: '600' },

  quickNumsTitle: { fontSize: 11, fontWeight: 'bold', color: '#9ca3af', marginTop: 16, marginBottom: 8 },
  quickNumsRow: { flexDirection: 'row', gap: 12 },
  quickNumBox: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, alignItems: 'center' },
  quickNumVal: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  quickNumLbl: { fontSize: 12, color: '#6b7280', marginTop: 4 },

  actRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  actIcon: { fontSize: 20 },
  actTitle: { fontSize: 14, fontWeight: '600', color: '#111827', textTransform: 'capitalize' },
  actSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  actTime: { fontSize: 12, color: '#9ca3af', fontWeight: '500' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  actionCard: { 
    width: (width - 52) / 2, backgroundColor: '#fff', borderRadius: 16, padding: 16, 
    shadowColor: '#000', shadowOpacity: 0.03, elevation: 1, flexDirection: 'row', alignItems: 'center', gap: 12
  },
  actionIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  actionIcon: { fontSize: 20 },
  actionLabel: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  actionDesc: { fontSize: 11, color: '#6b7280', marginTop: 2 },
});
