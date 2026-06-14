import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Keyboard, Alert, ActivityIndicator } from 'react-native';
import CustomButton from '../components/CustomButton';
import { verifyEmailOtp, verifyPhoneOtp } from '../auth/firebaseAuth';

export default function OTP({ route, navigation }: any) {
  const email = route.params?.email || 'alex@startup.io';
  const phone = route.params?.phone || '';
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'email' | 'phone'>('email');
  const inputs = useRef<any[]>([]);

  const handleChangeText = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input cell
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otp = code.join('');
    if (otp.length < 6) {
      Alert.alert('Error', 'Please enter a 6-digit OTP code');
      return;
    }

    Keyboard.dismiss();
    setLoading(true);

    if (currentStep === 'email') {
      const res = await verifyEmailOtp(email, otp);
      setLoading(false);

      if (res.success) {
        if (res.nextStep === 'phone') {
          Alert.alert('Email Verified', `Please enter the SMS OTP sent to your phone: ${phone}`);
          setCurrentStep('phone');
          setCode(['', '', '', '', '', '']);
        } else {
          Alert.alert('Success', 'Account verified! Welcome to Survexa 🎉');
        }
      } else {
        Alert.alert('Verification Failed', res.error || 'Invalid OTP code.');
      }
    } else {
      const res = await verifyPhoneOtp(phone, otp);
      setLoading(false);

      if (res.success) {
        Alert.alert('Success', 'Phone verified! Welcome to Survexa 🎉');
      } else {
        Alert.alert('Verification Failed', res.error || 'Invalid OTP code.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {currentStep === 'email' ? 'Verify email' : 'Verify phone number'}
      </Text>
      <Text style={styles.subtitle}>
        {currentStep === 'email' ? (
          <>Enter the 6-digit code sent to <Text style={styles.bold}>{email}</Text></>
        ) : (
          <>Enter the 6-digit code sent to <Text style={styles.bold}>{phone}</Text></>
        )}
      </Text>

      <View style={styles.otpRow}>
        {code.map((val, idx) => (
          <TextInput
            key={idx}
            ref={(ref) => { inputs.current[idx] = ref; }}
            style={styles.otpCell}
            maxLength={1}
            keyboardType="number-pad"
            value={val}
            onChangeText={(text) => handleChangeText(text, idx)}
            onKeyPress={(e) => handleKeyPress(e, idx)}
          />
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#8B5CF6" style={styles.loader} />
      ) : (
        <CustomButton
          title="Verify & continue"
          onPress={handleVerify}
          variant="primary"
          style={styles.button}
        />
      )}

      <CustomButton
        title="Resend code"
        onPress={() => {
          Alert.alert('OTP Resent', 'A new OTP code has been dispatched.');
        }}
        variant="ghost"
        style={styles.resendButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 24,
    paddingTop: 80,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '600',
    color: '#0F172A',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 32,
  },
  otpCell: {
    width: 44,
    height: 54,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: '#0F172A',
  },
  button: {
    width: '100%',
  },
  resendButton: {
    marginTop: 10,
    width: '100%',
  },
  loader: {
    marginTop: 20,
  },
});
