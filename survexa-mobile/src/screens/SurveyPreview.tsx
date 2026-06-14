import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import CustomButton from '../components/CustomButton';

export default function SurveyPreview({ navigation }: any) {
  const [selectedScore, setSelectedScore] = useState<number | null>(null);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Preview</Text>

      <View style={styles.heroCard}>
        <Text style={styles.surveyTitle}>Customer NPS Q2</Text>
        <Text style={styles.surveyDuration}>Estimated time: 3 min</Text>
      </View>

      <View style={styles.qCard}>
        <Text style={styles.qText}>How likely are you to recommend Survexa to a colleague or friend?</Text>
        <View style={styles.scoreRow}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.scoreChip,
                selectedScore === num && styles.scoreChipSelected,
              ]}
              onPress={() => setSelectedScore(num)}
            >
              <Text
                style={[
                  styles.scoreText,
                  selectedScore === num && styles.scoreTextSelected,
                ]}
              >
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.labelRow}>
          <Text style={styles.scaleLabel}>Not likely</Text>
          <Text style={styles.scaleLabel}>Very likely</Text>
        </View>
      </View>

      <CustomButton
        title="Publish survey"
        onPress={() => navigation.navigate('SurveySharing')}
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
    marginBottom: 20,
  },
  heroCard: {
    backgroundColor: '#C8D4FF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },
  surveyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  surveyDuration: {
    fontSize: 12,
    color: '#334155',
    marginTop: 6,
    fontWeight: '600',
  },
  qCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  qText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 20,
    marginBottom: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  scoreChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 3,
  },
  scoreChipSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  scoreTextSelected: {
    color: '#FFFFFF',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  scaleLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  btn: {
    width: '100%',
  },
});
