import React, { useRef } from 'react';
import { TouchableWithoutFeedback, Animated, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { brandColors } from '../theme/colors';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'soft' | 'ghost';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export default function CustomButton({
  title,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  disabled = false,
}: CustomButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const buttonStyle = [
    styles.btn,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'soft' && styles.soft,
    variant === 'ghost' && styles.ghost,
    style,
    disabled && styles.disabled,
  ];

  const labelStyle = [
    styles.text,
    variant === 'primary' && styles.textPrimary,
    variant === 'secondary' && styles.textSecondary,
    variant === 'soft' && styles.textSoft,
    variant === 'ghost' && styles.textGhost,
    textStyle,
  ];

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View style={[buttonStyle, { transform: [{ scale }] }]}>
        <Text style={labelStyle}>{title}</Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  primary: {
    backgroundColor: '#8B5CF6',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },
  soft: {
    backgroundColor: 'rgba(214, 198, 255, 0.25)',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
  },
  textPrimary: {
    color: '#FFFFFF',
  },
  textSecondary: {
    color: '#334155',
  },
  textSoft: {
    color: '#8B5CF6',
  },
  textGhost: {
    color: '#64748B',
  },
});
