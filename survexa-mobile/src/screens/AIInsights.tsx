import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import CustomButton from '../components/CustomButton';

export default function AIInsights({ navigation }: any) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>AI Insights</Text>

      <View style={styles.insightCard}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✨ HIGH CONFIDENCE</Text>
        </View>
        <Text style={styles.insightTitle}>Response spike detected</Text>
        <Text style={styles.insightDesc}>
          Thursday submissions are 34% above average. Consider extending the survey window to capture more responses.
        </Text>
      </View>

      <View style={styles.insightCard}>
        <Text style={styles.insightTitle}>Sentiment trend</Text>
        <Text style={styles.insightDesc}>
          Positive sentiment has increased from 62% to 71% after onboarding flow updates were implemented.
        </Text>
      </View>

      <View style={styles.insightCard}>
        <Text style={styles.insightTitle}>Drop-off point</Text>
        <Text style={styles.insightDesc}>
          18% of respondents abandon the survey at question 4. Consider shortening this question or splitting it into two steps.
        </Text>
      </View>

      <CustomButton
        title="View recommendations"
        onPress={() => navigation.navigate('Recommendations')}
        variant="primary"
        style={styles.btn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 16,
    marginVertical: 6,
  },
  badge: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  insightDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  btn: {
    marginTop: 20,
    width: '100%',
  },
});
