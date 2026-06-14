import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import CustomButton from '../components/CustomButton';
import GlassCard from '../components/GlassCard';

export default function AIGenerator({ navigation }: any) {
  const [prompt, setPrompt] = useState('Post-purchase satisfaction for our SaaS onboarding flow');
  const [chips, setChips] = useState(['NPS', 'CSAT', '5 questions', 'B2B']);
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setQuestions([
        'How satisfied are you with onboarding?',
        'Would you recommend us to a colleague?',
        'What could we improve about the setup process?',
      ]);
      setLoading(false);
    }, 1500);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>AI Generator</Text>
      
      <GlassCard style={styles.promptCard}>
        <Text style={styles.label}>Describe your survey goal</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={4}
          value={prompt}
          onChangeText={setPrompt}
          placeholder="e.g. Measure customer satisfaction after product launch..."
        />
        <View style={styles.chipRow}>
          {chips.map((c) => (
            <TouchableOpacity key={c} style={styles.chip}>
              <Text style={styles.chipText}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </GlassCard>

      <CustomButton
        title={loading ? 'Generating...' : '🤖 Generate questions'}
        onPress={handleGenerate}
        variant="primary"
        style={styles.btn}
        disabled={loading}
      />

      {questions.length > 0 && (
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>Preview Questions</Text>
          {questions.map((q, i) => (
            <View key={i} style={styles.qBlock}>
              <Text style={styles.qIndex}>QUESTION {i + 1}</Text>
              <Text style={styles.qText}>{q}</Text>
            </View>
          ))}
          <CustomButton
            title="Import to Builder"
            onPress={() => navigation.navigate('SurveyBuilder')}
            variant="secondary"
            style={styles.importBtn}
          />
        </View>
      )}
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
  promptCard: {
    padding: 16,
    alignItems: 'stretch',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 12,
    fontSize: 14,
    color: '#0F172A',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  chip: {
    backgroundColor: 'rgba(214, 198, 255, 0.25)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  btn: {
    marginTop: 20,
  },
  previewSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  qBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
    marginVertical: 6,
  },
  qIndex: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  qText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 18,
  },
  importBtn: {
    marginTop: 16,
  },
});
