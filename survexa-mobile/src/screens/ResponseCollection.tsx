import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function ResponseCollection() {
  const responses = [
    { name: 'Sarah K.', score: 9, time: '2m ago', initial: 'S' },
    { name: 'James L.', score: 8, time: '5m ago', initial: 'J' },
    { name: 'Mia T.', score: 10, time: '12m ago', initial: 'M' },
    { name: 'Robert P.', score: 7, time: '30m ago', initial: 'R' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Responses</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>⚡ LIVE</Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View>
          <Text style={styles.summaryVal}>847</Text>
          <Text style={styles.summaryCaption}>Total responses</Text>
        </View>
        <View style={styles.rateCard}>
          <Text style={styles.rateText}>Completion: 92%</Text>
        </View>
      </View>

      {responses.map((resp, idx) => (
        <View key={idx} style={styles.respCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{resp.initial}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{resp.name}</Text>
            <Text style={styles.score}>NPS score: {resp.score}</Text>
          </View>
          <Text style={styles.time}>{resp.time}</Text>
        </View>
      ))}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  badge: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  summaryVal: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
  },
  summaryCaption: {
    fontSize: 12,
    color: '#64748B',
  },
  rateCard: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  rateText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  respCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 14,
    marginVertical: 5,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#D6C6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  score: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  time: {
    fontSize: 11,
    color: '#94A3B8',
  },
});
