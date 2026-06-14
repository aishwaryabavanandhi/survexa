import { StyleSheet } from 'react-native';

export const typography = StyleSheet.create({
  displayLg: {
    fontFamily: 'System', // Will map to Plus Jakarta Sans if loaded
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  },
  displayMd: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
  },
  headingLg: {
    fontFamily: 'System',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
  },
  headingMd: {
    fontFamily: 'System',
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
  },
  bodyMd: {
    fontFamily: 'System',
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
  },
  bodySm: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  caption: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 14,
  },
  mono: {
    fontFamily: 'System', // Will map to JetBrains Mono if loaded
    fontSize: 13,
  },
});
