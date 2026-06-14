import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Clipboard } from 'react-native';
import CustomButton from '../components/CustomButton';

export default function SurveySharing({ navigation }: any) {
  const options = [
    { type: 'link', label: 'Copy link', sub: 'survexa.app/s/nps-q2', val: 'https://survexa.app/s/nps-q2' },
    { type: 'invite', label: 'Email invite', sub: 'Send to contacts', val: '' },
    { type: 'social', label: 'Social share', sub: 'LinkedIn, X, Slack', val: 'https://survexa.app/s/nps-q2' },
  ];

  const handleShare = async (val: string) => {
    if (!val) return;
    try {
      await Share.share({ message: `Please take my Survexa survey: ${val}` });
    } catch (_) {}
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Share survey</Text>
      <Text style={styles.subtitle}>
        Your survey is live. Share it to start collecting responses in real time.
      </Text>

      {options.map((opt) => (
        <TouchableOpacity
          key={opt.label}
          style={styles.optionItem}
          onPress={() => opt.type === 'link' ? Clipboard.setString(opt.val) : handleShare(opt.val)}
        >
          <View style={styles.leftRow}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconSymbol}>🔗</Text>
            </View>
            <View>
              <Text style={styles.optionLabel}>{opt.label}</Text>
              <Text style={styles.optionSub}>{opt.sub}</Text>
            </View>
          </View>
          <Text style={styles.chevron}>→</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.optionItem}
        onPress={() => navigation.navigate('QRCode')}
      >
        <View style={styles.leftRow}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconSymbol}>📱</Text>
          </View>
          <View>
            <Text style={styles.optionLabel}>QR code</Text>
            <Text style={styles.optionSub}>Print or display</Text>
          </View>
        </View>
        <Text style={styles.chevron}>→</Text>
      </TouchableOpacity>

      <CustomButton
        title="Go to dashboard"
        onPress={() => navigation.replace('Dashboard')}
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 24,
  },
  optionItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(214, 198, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconSymbol: {
    fontSize: 16,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  optionSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  chevron: {
    fontSize: 16,
    color: '#64748B',
  },
  btn: {
    marginTop: 30,
  },
});
