import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuthStore } from '../store/authStore';
import GlassCard from '../components/GlassCard';
import { brandColors } from '../theme/colors';

export default function DarkModeSettings({ navigation }: any) {
  const { isDarkMode, setDarkMode } = useAuthStore();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backTxt}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Theme Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <Text style={styles.sectionTitle}>Choose Theme Mode</Text>

      <TouchableOpacity
        style={[styles.themeOption, !isDarkMode && styles.selectedOption]}
        onPress={() => setDarkMode(false)}
      >
        <View style={styles.row}>
          <Text style={styles.icon}>☀️</Text>
          <View>
            <Text style={styles.optionLabel}>Light Theme</Text>
            <Text style={styles.optionDesc}>Clean look with vibrant colors</Text>
          </View>
        </View>
        {!isDarkMode && <Text style={styles.check}>✓</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.themeOption, isDarkMode && styles.selectedOption]}
        onPress={() => setDarkMode(true)}
      >
        <View style={styles.row}>
          <Text style={styles.icon}>🌙</Text>
          <View>
            <Text style={styles.optionLabel}>Dark Theme</Text>
            <Text style={styles.optionDesc}>Reduced eye strain in low-light environments</Text>
          </View>
        </View>
        {isDarkMode && <Text style={styles.check}>✓</Text>}
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Theme Preview</Text>

      <GlassCard style={[styles.previewCard, { backgroundColor: isDarkMode ? '#1B2238' : '#FFFFFF', borderColor: isDarkMode ? '#2A3454' : '#E2E8F0' }]}>
        <Text style={[styles.previewTitle, { color: isDarkMode ? '#FFFFFF' : '#0F172A' }]}>
          Survexa Dashboard
        </Text>
        <Text style={[styles.previewDesc, { color: isDarkMode ? '#9CA3AF' : '#64748B' }]}>
          Here is how your interface components and text labels appear in the selected theme mode.
        </Text>
        
        <View style={styles.previewStats}>
          <View style={[styles.previewStat, { backgroundColor: brandColors.cyan }]}>
            <Text style={styles.statText}>Cyan</Text>
          </View>
          <View style={[styles.previewStat, { backgroundColor: brandColors.lavender }]}>
            <Text style={styles.statText}>Lavender</Text>
          </View>
        </View>
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 10,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedOption: {
    borderColor: '#8B5CF6',
    borderWidth: 2,
    backgroundColor: 'rgba(139, 92, 246, 0.03)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 22,
    marginRight: 14,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  optionDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginRight: 20,
  },
  check: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  previewCard: {
    marginTop: 10,
    padding: 20,
    alignItems: 'flex-start',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  previewDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  previewStats: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
  },
  previewStat: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  statText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
});
