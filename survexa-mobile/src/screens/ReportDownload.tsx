import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import CustomButton from '../components/CustomButton';
import { brandColors } from '../theme/colors';

export default function ReportDownload({ navigation }: any) {
  const [selectedFormat, setSelectedFormat] = useState('PDF — Full report');

  const formats = ['PDF — Full report', 'PDF — Executive summary', 'CSV — Raw data'];

  const handleDownload = () => {
    Alert.alert('Download Started', `Your file "${selectedFormat}" is downloading to your device folders.`, [
      { text: 'OK', onPress: () => navigation.popToTop() },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Download report</Text>
      <Text style={styles.subtitle}>Choose export format</Text>

      {formats.map((fmt) => (
        <TouchableOpacity
          key={fmt}
          style={[
            styles.optionCard,
            selectedFormat === fmt && styles.optionCardSelected,
          ]}
          onPress={() => setSelectedFormat(fmt)}
        >
          <View style={styles.leftRow}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>⬇</Text>
            </View>
            <Text style={styles.label}>{fmt}</Text>
          </View>
          {selectedFormat === fmt && <Text style={styles.check}>✓</Text>}
        </TouchableOpacity>
      ))}

      <CustomButton
        title="Download now"
        onPress={handleDownload}
        variant="primary"
        style={styles.btn}
      />
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 16,
    marginVertical: 6,
  },
  optionCardSelected: {
    borderColor: '#8B5CF6',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: brandColors.peach,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 14,
    color: '#D97706',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  check: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  btn: {
    marginTop: 30,
    width: '100%',
  },
});
