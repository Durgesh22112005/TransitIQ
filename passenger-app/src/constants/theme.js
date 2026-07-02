// =============================================================
// src/constants/theme.js  – Passenger App Design System
// Warm violet-purple gradient palette, distinct from driver app
// =============================================================

export const COLORS = {
  // Primary brand
  primary:      '#7C3AED',   // vivid violet
  primaryDark:  '#5B21B6',
  primaryLight: '#A78BFA',

  // Accent
  accent:       '#F59E0B',   // amber
  accentLight:  '#FCD34D',

  // Semantic
  success:      '#10B981',
  warning:      '#F59E0B',
  danger:       '#EF4444',
  info:         '#6366F1',

  // Neutrals
  background:   '#09090F',
  surface:      '#12121F',
  surfaceLight: '#1C1C2E',
  border:       '#2D2D4E',

  // Text
  textPrimary:  '#FFFFFF',
  textSecondary:'#A0A0C0',
  textMuted:    '#6060A0',

  // Gradient stops
  gradientStart:'#7C3AED',
  gradientEnd:  '#F59E0B',
};

export const TYPOGRAPHY = {
  fontFamily: 'System',
  sizes: {
    xs:    10,
    sm:    12,
    md:    14,
    lg:    16,
    xl:    18,
    '2xl': 22,
    '3xl': 28,
    '4xl': 36,
  },
  weights: {
    regular:  '400',
    medium:   '500',
    semibold: '600',
    bold:     '700',
    black:    '900',
  },
};

export const SPACING = {
  xs:    4,
  sm:    8,
  md:    16,
  lg:    24,
  xl:    32,
  '2xl': 48,
  '3xl': 64,
};

export const RADIUS = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 9999,
};

export const SHADOWS = {
  card: {
    shadowColor:   '#7C3AED',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius:  12,
    elevation:     8,
  },
  elevated: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius:  16,
    elevation:     12,
  },
};
