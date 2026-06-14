import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import GlassCard from '../components/GlassCard';
import CustomButton from '../components/CustomButton';
import { useAuthStore } from '../store/authStore';
import { brandColors } from '../theme/colors';

export default function Dashboard({ navigation }: any) {
  const user = useAuthStore((state) => state.user);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View>
          <Text style={styles.caption}>Good morning</Text>
          <Text style={styles.title}>{user?.name || 'Alex Morgan'}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications')}
          style={styles.bellBtn}
        >
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <GlassCard style={styles.aiCard}>
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>🤖 AI ASSISTANT</Text>
        </View>
        <Text style={styles.aiTitle}>3 insights ready</Text>
        <Text style={styles.aiDesc}>
          Response rate is up 24% this week. Review your recommendations now.
        </Text>
        <CustomButton
          title="View insights"
          onPress={() => navigation.navigate('AIInsights')}
          variant="soft"
          style={styles.aiBtn}
          textStyle={{ color: '#8B5CF6' }}
        />
      </GlassCard>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: brandColors.lavender }]}>
          <Text style={styles.statCaption}>Active surveys</Text>
          <Text style={styles.statVal}>12</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: brandColors.mint }]}>
          <Text style={styles.statCaption}>Responses today</Text>
          <Text style={styles.statVal}>847</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent surveys</Text>
      {['Customer NPS Q2', 'Product feedback', 'Employee pulse'].map((srv) => (
        <TouchableOpacity
          key={srv}
          onPress={() => navigation.navigate('SurveyPreview')}
          style={styles.surveyItem}
        >
          <View style={styles.surveyRow}>
            <Text style={styles.surveyTitle}>{srv}</Text>
            <Text style={styles.chevron}>→</Text>
          </View>
          <Text style={styles.surveyCaption}>Last updated 2h ago · 156 responses</Text>
        </TouchableOpacity>
      ))}

      <CustomButton
        title="+ New survey"
        onPress={() => navigation.navigate('CreateSurvey')}
        variant="primary"
        style={styles.createBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  caption: {
    fontSize: 12,
    color: '#64748B',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bellIcon: {
    fontSize: 18,
  },
  aiCard: {
    marginVertical: 10,
    alignItems: 'flex-start',
  },
  aiBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  aiDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12,
  },
  aiBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 0,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 14,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 4,
  },
  statCaption: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  statVal: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 20,
    marginBottom: 10,
  },
  surveyItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  surveyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  surveyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  chevron: {
    fontSize: 16,
    color: '#64748B',
  },
  surveyCaption: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  createBtn: {
    marginTop: 20,
  },
});
