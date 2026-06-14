import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChartView } from '../components/Charts';

export default function PieChart() {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Pie analytics</Text>
      <PieChartView />
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
});
