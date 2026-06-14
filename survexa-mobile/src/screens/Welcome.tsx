import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CustomButton from '../components/CustomButton';
import { brandColors } from '../theme/colors';

export default function Welcome({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>🤖 AI-POWERED</Text>
        </View>
        <Text style={styles.title}>Survey smarter with Survexa</Text>
        <Text style={styles.subtitle}>
          Create intelligent surveys, collect responses in real time, and deliver automated PDF reports.
        </Text>
      </View>
      <View style={styles.footer}>
        <CustomButton
          title="Get started free"
          onPress={() => navigation.navigate('Signup')}
          variant="primary"
          style={styles.button}
        />
        <CustomButton
          title="I have an account"
          onPress={() => navigation.navigate('Login')}
          variant="secondary"
          style={styles.button}
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
    justifyContent: 'space-between',
    paddingVertical: 50,
  },
  content: {
    alignItems: 'center',
    marginTop: 100,
  },
  aiBadge: {
    backgroundColor: 'rgba(214, 198, 255, 0.3)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  aiBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
  },
  footer: {
    width: '100%',
  },
  button: {
    width: '100%',
    marginVertical: 6,
  },
});
