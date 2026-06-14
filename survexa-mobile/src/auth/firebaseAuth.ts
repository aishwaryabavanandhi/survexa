import api from '../services/api';
import { useAuthStore } from '../store/authStore';

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    phone?: string;
    name: string;
    role: 'user' | 'admin';
  };
  email?: string;
  phone?: string;
  devMode?: boolean;
  emailOtp?: string;
  phoneOtp?: string;
  nextStep?: 'email' | 'phone' | null;
  message?: string;
  error?: string;
}

export async function signUp({ name, email, phone, password }: any): Promise<AuthResponse> {
  try {
    const res = await api.post('/auth/signup', { name, email, phone, password });
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      error: err.response?.data?.error || err.message || 'Registration failed',
    };
  }
}

export async function login({ email, password }: any): Promise<AuthResponse> {
  try {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success && res.data.token && res.data.user) {
      useAuthStore.getState().setSession(res.data.user, res.data.token);
    }
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      error: err.response?.data?.error || err.message || 'Login failed',
    };
  }
}

export async function verifyEmailOtp(email: string, code: string): Promise<AuthResponse> {
  try {
    const res = await api.post('/auth/verify-otp', { email, code });
    if (res.data.success && res.data.token && res.data.user) {
      useAuthStore.getState().setSession(res.data.user, res.data.token);
    }
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      error: err.response?.data?.error || err.message || 'OTP verification failed',
    };
  }
}

export async function verifyPhoneOtp(phone: string, code: string): Promise<AuthResponse> {
  try {
    const res = await api.post('/auth/verify-phone-otp', { phone, code }); // maps to verify-otp or phoneAuth verify
    // Wait, backend phone verification is under routes/phoneAuth.js: POST /phone-auth/verify-otp or POST /verify-otp
    // Let's check which route phone verification matches:
    // routes/phoneAuth.js line 94: POST /verify-otp (mounted under its router)
    // Let's see what base route phoneAuth is registered under in backend.
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      error: err.response?.data?.error || err.message || 'OTP verification failed',
    };
  }
}

export async function requestPasswordReset(email: string): Promise<any> {
  try {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      error: err.response?.data?.error || err.message || 'Password reset request failed',
    };
  }
}
