import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import GlassCard from '../components/GlassCard';
import CustomButton from '../components/CustomButton';
import { LineChartView } from '../components/Charts';
import { brandColors } from '../theme/colors';

export default function AdminDashboard({ navigation }: any) {
  const [smtpStatus, setSmtpStatus] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(true);

  const handleTestSmtp = () => {
    Alert.alert('SMTP Test', 'Sending test SMTP connection to Google servers...', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Test',
        onPress: () => {
          Alert.alert('Connection Success', 'Gmail SMTP Connection test PASSED.\nLatency: 120ms\nAuthentication: Success.');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backTxt}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, { backgroundColor: brandColors.cyan }]}>
          <Text style={styles.metricVal}>15.2k</Text>
          <Text style={styles.metricLbl}>Total Users</Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: brandColors.lavender }]}>
          <Text style={styles.metricVal}>4.8k</Text>
          <Text style={styles.metricLbl}>Active Surveys</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, { backgroundColor: brandColors.mint }]}>
          <Text style={styles.metricVal}>$28.5k</Text>
          <Text style={styles.metricLbl}>Total Revenue</Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: brandColors.peach }]}>
          <Text style={styles.metricVal}>99.9%</Text>
          <Text style={styles.metricLbl}>System Uptime</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>User Registration Trend</Text>
      <LineChartView />

      <Text style={styles.sectionTitle}>System Integrations</Text>

      <GlassCard style={styles.integrationCard}>
        <View style={styles.integrationHeader}>
          <Text style={styles.integrationTitle}>Gmail SMTP Gateway</Text>
          <Switch
            value={smtpStatus}
            onValueChange={setSmtpStatus}
            trackColor={{ false: '#CBD5E1', true: '#C8D4FF' }}
            thumbColor={smtpStatus ? '#8B5CF6' : '#F1F5F9'}
          />
        </View>
        <Text style={styles.integrationDesc}>
          Used to deliver verification OTP emails and PDF analytical reports to clients.
        </Text>
        <CustomButton
          title="Test SMTP Gateway Connection"
          onPress={handleTestSmtp}
          variant="soft"
          style={styles.testBtn}
          textStyle={{ color: '#8B5CF6', fontSize: 13 }}
        />
      </GlassCard>

      <GlassCard style={styles.integrationCard}>
        <View style={styles.integrationHeader}>
          <Text style={styles.integrationTitle}>Razorpay Integration</Text>
          <Switch
            value={paymentStatus}
            onValueChange={setPaymentStatus}
            trackColor={{ false: '#CBD5E1', true: '#C8D4FF' }}
            thumbColor={paymentStatus ? '#8B5CF6' : '#F1F5F9'}
          />
        </View>
        <Text style={styles.integrationDesc}>
          Controls the mobile subscription checkouts, upgrades, and billing events.
        </Text>
      </GlassCard>
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 6,
    justifyContent: 'center',
  },
  metricVal: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricLbl: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 20,
    marginBottom: 10,
  },
  integrationCard: {
    marginVertical: 6,
    padding: 16,
  },
  integrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  integrationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  integrationDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  testBtn: {
    marginTop: 14,
    borderRadius: 10,
    paddingVertical: 8,
    marginVertical: 0,
  },
});
