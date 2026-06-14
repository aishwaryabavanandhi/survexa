import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import CustomButton from '../components/CustomButton';
import GlassCard from '../components/GlassCard';
import { brandColors } from '../theme/colors';

export default function CreateSurvey({ navigation }: any) {
  const templates = [
    { name: 'Customer satisfaction', color: brandColors.cyan },
    { name: 'Employee engagement', color: brandColors.lavender },
    { name: 'Market research', color: brandColors.peach },
    { name: 'Event feedback', color: brandColors.mint },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Create survey</Text>
      
      <TouchableOpacity
        onPress={() => navigation.navigate('AIGenerator')}
        activeOpacity={0.9}
      >
        <GlassCard style={styles.aiCard}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>✨ RECOMMENDED</Text>
              </View>
              <Text style={styles.cardTitle}>Start with AI</Text>
              <Text style={styles.cardSubtitle}>Generate survey questions from a brief prompt.</Text>
            </View>
            <View style={styles.orb} />
          </View>
        </GlassCard>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Templates</Text>
      <View style={styles.grid}>
        {templates.map((tpl) => (
          <TouchableOpacity
            key={tpl.name}
            style={[styles.templateCard, { backgroundColor: tpl.color }]}
            onPress={() => navigation.navigate('SurveyBuilder')}
          >
            <Text style={styles.templateName}>{tpl.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <CustomButton
        title="Blank survey"
        onPress={() => navigation.navigate('SurveyBuilder')}
        variant="secondary"
        style={styles.blankBtn}
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
  aiCard: {
    padding: 20,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: 10,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  orb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#C8D4FF',
    marginLeft: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 24,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  templateCard: {
    width: '48%',
    borderRadius: 20,
    padding: 16,
    height: 100,
    marginBottom: 12,
    justifyContent: 'flex-end',
  },
  templateName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  blankBtn: {
    marginTop: 20,
  },
});
