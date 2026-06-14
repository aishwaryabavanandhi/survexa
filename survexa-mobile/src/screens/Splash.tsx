import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { brandColors } from '../theme/colors';

export default function Splash({ navigation }: any) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>S</Text>
      </View>
      <Text style={styles.title}>Survexa</Text>
      <Text style={styles.subtitle}>AI-Powered Survey Platform</Text>
      <ActivityIndicator size="small" color="#8B5CF6" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1020',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 30,
    backgroundColor: brandColors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: brandColors.lavender,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#0B1020',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});
