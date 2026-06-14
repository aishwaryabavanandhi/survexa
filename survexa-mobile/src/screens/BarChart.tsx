import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChartView } from '../components/Charts';

export default function BarChart() {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Bar analytics</Text>
      <BarChartView />
      <Text style={styles.caption}>Source: Customer NPS Q2 · Last 7 days</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
  },
  caption: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 10,
    textAlign: 'center',
  },
});
