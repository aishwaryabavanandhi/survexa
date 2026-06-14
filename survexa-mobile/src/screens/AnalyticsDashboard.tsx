import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BarChartView } from '../components/Charts';
import CustomButton from '../components/CustomButton';

export default function AnalyticsDashboard({ navigation }: any) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Analytics</Text>

      <View style={styles.metricRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricCaption}>Completion rate</Text>
          <Text style={styles.metricVal}>78%</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricCaption}>Avg. NPS</Text>
          <Text style={styles.metricVal}>+42</Text>
        </View>
      </View>

      <BarChartView />

      <View style={styles.btnSection}>
        <CustomButton
          title="Bar Analytics"
          onPress={() => navigation.navigate('BarChart')}
          variant="secondary"
          style={styles.subBtn}
        />
        <CustomButton
          title="Pie Analytics"
          onPress={() => navigation.navigate('PieChart')}
          variant="secondary"
          style={styles.subBtn}
        />
        <CustomButton
          title="Trend Analytics"
          onPress={() => navigation.navigate('LineChart')}
          variant="secondary"
          style={styles.subBtn}
        />
        <CustomButton
          title="PDF Report Preview"
          onPress={() => navigation.navigate('PDFPreview')}
          variant="primary"
          style={styles.exportBtn}
        />
      </View>
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
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 4,
  },
  metricCaption: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  metricVal: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
  },
  btnSection: {
    marginTop: 14,
  },
  subBtn: {
    marginVertical: 4,
    width: '100%',
  },
  exportBtn: {
    marginTop: 16,
    width: '100%',
  },
});
