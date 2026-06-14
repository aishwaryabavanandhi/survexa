import React from 'react';
import { View, Text, StyleSheet, Share } from 'react-native';
import CustomButton from '../components/CustomButton';

export default function QRCode({ navigation }: any) {
  const handleShare = async () => {
    try {
      await Share.share({ message: 'Join our customer feedback survey here: https://survexa.app/s/nps-q2' });
    } catch (_) {}
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>QR Code</Text>
      
      <View style={styles.qrContainer}>
        {/* Mocking QR pattern with nice vector-style layout */}
        <View style={styles.qrBox}>
          <View style={styles.qrCorner} />
          <View style={[styles.qrCorner, { right: 20 }]} />
          <View style={[styles.qrCorner, { bottom: 20 }]} />
          <View style={styles.qrCenter} />
        </View>
      </View>

      <Text style={styles.surveyTitle}>Customer NPS Q2</Text>
      <Text style={styles.subtitle}>Scan to open survey directly</Text>

      <View style={styles.btnRow}>
        <CustomButton
          title="Save"
          onPress={() => {}}
          variant="secondary"
          style={styles.subBtn}
        />
        <CustomButton
          title="Share"
          onPress={handleShare}
          variant="primary"
          style={styles.subBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 24,
    paddingTop: 50,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 40,
    alignSelf: 'flex-start',
  },
  qrContainer: {
    width: 220,
    height: 220,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  qrBox: {
    width: 140,
    height: 140,
    position: 'relative',
  },
  qrCorner: {
    width: 40,
    height: 40,
    borderWidth: 8,
    borderColor: '#0F172A',
    position: 'absolute',
  },
  qrCenter: {
    width: 50,
    height: 50,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    position: 'absolute',
    top: 45,
    left: 45,
  },
  surveyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 40,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  subBtn: {
    flex: 1,
    marginHorizontal: 6,
  },
});
