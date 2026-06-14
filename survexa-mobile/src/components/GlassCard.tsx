import React from 'react';
import { StyleSheet, View, ViewStyle, Platform, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
}

export default function GlassCard({ children, style, intensity = 40 }: GlassCardProps) {
  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={intensity} style={[styles.glass, style]}>
        {children}
      </BlurView>
    );
  }

  // Fallback for Android which has partial support for dynamic blurs natively
  return (
    <View style={[styles.glassFallback, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  glass: {
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  glassFallback: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
});
