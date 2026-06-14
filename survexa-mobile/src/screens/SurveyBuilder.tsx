import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import CustomButton from '../components/CustomButton';

export default function SurveyBuilder({ navigation }: any) {
  const [title, setTitle] = useState('Customer NPS Q2');
  const [questions, setQuestions] = useState([
    { type: 'Rating scale', text: 'How likely are you to recommend Survexa?' },
    { type: 'Multiple choice', text: 'Which feature do you use most frequently?' },
    { type: 'Open text', text: 'What is the biggest improvement we can make?' },
  ]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Builder</Text>

      <View style={styles.titleRow}>
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
        />
        <TouchableOpacity style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>
      <Text style={styles.countText}>{questions.length} of 8 questions added</Text>

      {questions.map((q, idx) => (
        <View key={idx} style={styles.qCard}>
          <View style={styles.qHeader}>
            <View style={styles.qBadge}>
              <Text style={styles.qBadgeText}>{q.type}</Text>
            </View>
            <Text style={styles.reqText}>Required</Text>
          </View>
          <Text style={styles.qText}>{q.text}</Text>
        </View>
      ))}

      <CustomButton
        title="+ Add question"
        onPress={() => {}}
        variant="secondary"
        style={styles.addBtn}
      />

      <CustomButton
        title="Preview survey"
        onPress={() => navigation.navigate('SurveyPreview')}
        variant="primary"
        style={styles.previewBtn}
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  saveBtn: {
    marginLeft: 12,
    backgroundColor: 'rgba(214, 198, 255, 0.25)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    width: '100%',
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: {
    width: '75%',
    height: '100%',
    backgroundColor: '#8B5CF6',
  },
  countText: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 16,
  },
  qCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
  },
  qHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  qBadge: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  qBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  reqText: {
    fontSize: 11,
    color: '#64748B',
  },
  qText: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
  },
  addBtn: {
    marginTop: 12,
  },
  previewBtn: {
    marginTop: 10,
  },
});
