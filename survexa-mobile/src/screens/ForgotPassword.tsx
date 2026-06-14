import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import Input from '../components/Input';
import CustomButton from '../components/CustomButton';
import { requestPasswordReset } from '../auth/firebaseAuth';

export default function ForgotPassword({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      setError('Email address is required');
      return;
    }

    setLoading(true);
    const res = await requestPasswordReset(email);
    setLoading(false);

    if (res.success || res.message) {
      Alert.alert('Reset Link Sent', res.message || `We sent a secure password reset link to ${email}.`, [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } else {
      Alert.alert('Error', res.error || 'Failed to request password reset link.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset password</Text>
      <Text style={styles.subtitle}>We will send a secure link to reset your password.</Text>

      <Input
        label="Email address"
        placeholder="you@company.com"
        value={email}
        onChangeText={setEmail}
        error={error}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {loading ? (
        <ActivityIndicator size="large" color="#8B5CF6" style={styles.loader} />
      ) : (
        <CustomButton
          title="Send reset link"
          onPress={handleReset}
          variant="primary"
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 24,
    paddingTop: 80,
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
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    marginTop: 20,
    width: '100%',
  },
  loader: {
    marginTop: 20,
  },
});
