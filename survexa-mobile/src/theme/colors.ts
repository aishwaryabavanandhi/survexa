export const brandColors = {
  cyan: '#B8F2F5',
  lavender: '#D6C6FF',
  periwinkle: '#C8D4FF',
  mint: '#CFF8E3',
  peach: '#FFD7B8',
  pink: '#F5C3E8',
  lemon: '#FFF6B3',
};

export const lightTheme = {
  background: {
    primary: '#F8FAFC',
    secondary: '#FFFFFF',
    tertiary: '#F4F7FB',
  },
  card: {
    background: '#FFFFFF',
    backgroundAlt: '#FCFCFD',
  },
  text: {
    primary: '#0F172A',
    secondary: '#334155',
    muted: '#64748B',
  },
  border: '#E2E8F0',
  inputFocus: '#C8D4FF',
  primary: '#8B5CF6', // violet primary for interactive highlights
  success: '#10B981',
  error: '#EF4444',
  shadow: '#0F172A',
};

export const darkTheme = {
  background: {
    primary: '#0B1020',
    secondary: '#111827',
    tertiary: '#161B2E',
  },
  card: {
    background: '#1B2238',
    backgroundAlt: '#202944',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#D1D5DB',
    muted: '#9CA3AF',
  },
  border: '#2A3454',
  inputFocus: '#C8D4FF',
  primary: '#A78BFA',
  success: '#34D399',
  error: '#F87171',
  shadow: '#000000',
};

export type ThemeColors = typeof lightTheme;
