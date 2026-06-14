import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Input from '../components/Input';
import CustomButton from '../components/CustomButton';
import { login } from '../auth/firebaseAuth';

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleLogin = async () => {
    const errs: any = {};
    if (!email) errs.email = 'Email is required';
    if (!password) errs.password = 'Password is required';
    
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    const res = await login({ email, password });
    setLoading(false);

    if (res.success) {
      // Managed state change in useAuthStore will auto-navigate via AppNavigator
    } else {
      if (res.error?.includes('verify') || res.error?.includes('OTP')) {
        Alert.alert('Verification Required', 'Please verify your email address to log in.', [
          { text: 'Verify Now', onPress: () => navigation.navigate('OTP', { email }) }
        ]);
      } else {
        Alert.alert('Login Failed', res.error || 'Invalid email or password.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>
      <Text style={styles.subtitle}>Welcome back to Survexa</Text>

      <Input
        label="Email"
        placeholder="you@company.com"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Input
        label="Password"
        placeholder="Enter password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={errors.password}
        autoCapitalize="none"
      />

      <TouchableOpacity
        onPress={() => navigation.navigate('ForgotPassword')}
        style={styles.forgotBtn}
      >
        <Text style={styles.forgotText}>Forgot password?</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#8B5CF6" style={styles.loader} />
      ) : (
        <CustomButton
          title="Sign in"
          onPress={handleLogin}
          variant="primary"
          style={styles.button}
        />
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>New here? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.footerLink}>Create account</Text>
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
    paddingTop: 80,
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
    marginBottom: 24,
  },
  forgotBtn: {
    alignSelf: 'flex-start',
    marginVertical: 10,
  },
  forgotText: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '600',
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
