import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PaymentInfo {
  id: string;
  amount: number;
  date: string;
  status: 'success' | 'failed' | 'pending';
  plan: string;
}

interface BillingState {
  currentPlan: 'free' | 'pro' | 'enterprise';
  subscriptionId: string | null;
  paymentHistory: PaymentInfo[];
  setPlan: (plan: 'free' | 'pro' | 'enterprise', subId?: string | null) => void;
  addPayment: (payment: PaymentInfo) => void;
  clearBilling: () => void;
}

export const useBillingStore = create<BillingState>()(
  persist(
    (set) => ({
      currentPlan: 'free',
      subscriptionId: null,
      paymentHistory: [
        { id: 'TXN-9021', amount: 49, date: '2026-05-12', status: 'success', plan: 'pro' },
        { id: 'TXN-8742', amount: 49, date: '2026-04-12', status: 'success', plan: 'pro' },
      ],
      setPlan: (plan, subId = null) => set({ currentPlan: plan, subscriptionId: subId }),
      addPayment: (payment) => set((state) => ({ paymentHistory: [payment, ...state.paymentHistory] })),
      clearBilling: () => set({ currentPlan: 'free', subscriptionId: null, paymentHistory: [] }),
    }),
    {
      name: 'survexa-billing-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
