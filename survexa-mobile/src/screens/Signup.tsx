import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Input from '../components/Input';
import CustomButton from '../components/CustomButton';
import { signUp } from '../auth/firebaseAuth';

export default function Signup({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string; password?: string }>({});

  const handleSignup = async () => {
    const errs: any = {};
    if (!name) errs.name = 'Full name is required';
    if (!email) errs.email = 'Work email is required';
    if (!phone) errs.phone = 'Mobile number is required';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'Min. 8 characters';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    const res = await signUp({ name, email, phone, password });
    setLoading(false);

    if (res.success) {
      Alert.alert(
        'Account Created',
        res.message || 'OTP codes have been sent. Please verify your email.',
        [{ text: 'Verify', onPress: () => navigation.navigate('OTP', { email, phone }) }]
      );
    } else {
      Alert.alert('Registration Failed', res.error || 'Check details and try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Sign up with Survexa to start</Text>

      <Input
        label="Full name"
        placeholder="Alex Morgan"
        value={name}
        onChangeText={setName}
        error={errors.name}
      />

      <Input
        label="Work email"
        placeholder="alex@startup.io"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Input
        label="Mobile phone"
        placeholder="+919876543210"
        value={phone}
        onChangeText={setPhone}
        error={errors.phone}
        keyboardType="phone-pad"
        autoCapitalize="none"
      />

      <Input
        label="Password"
        placeholder="Min. 8 characters"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={errors.password}
        autoCapitalize="none"
      />

      {loading ? (
        <ActivityIndicator size="large" color="#8B5CF6" style={styles.loader} />
      ) : (
        <CustomButton
          title="Continue"
          onPress={handleSignup}
          variant="primary"
          style={styles.button}
        />
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.footerLink}>Sign in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 24,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    width: '100%',
  },
  loader: {
    marginTop: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 13,
    color: '#64748B',
  },
  footerLink: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '600',
  },
});
