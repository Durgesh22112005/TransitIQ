// =============================================================
// src/constants/theme.js  – Driver App Design System
// =============================================================

export const COLORS = {
  // Primary brand palette
  primary:      '#1A56FF',   // electric blue
  primaryDark:  '#0F3BC2',
  primaryLight: '#6B93FF',

  // Accent
  accent:       '#00D4AA',   // teal accent
  accentDark:   '#009E7F',

  // Semantic
  success:      '#22C55E',
  warning:      '#F59E0B',
  danger:       '#EF4444',
  info:         '#3B82F6',

  // Neutrals
  background:   '#0A0F1E',   // deep navy dark
  surface:      '#131929',
  surfaceLight: '#1E2A45',
  border:       '#2A3A5C',

  // Text
  textPrimary:  '#FFFFFF',
  textSecondary:'#94A3B8',
  textMuted:    '#64748B',

  // Gradient stops
  gradientStart:'#1A56FF',
  gradientEnd:  '#00D4AA',
};

export const TYPOGRAPHY = {
  fontFamily: 'System',
  sizes: {
    xs:   10,
    sm:   12,
    md:   14,
    lg:   16,
    xl:   18,
    '2xl':22,
    '3xl':28,
    '4xl':36,
  },
  weights: {
    regular: '400',
    medium:  '500',
    semibold:'600',
    bold:    '700',
    black:   '900',
  },
};

export const SPACING = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  '2xl':48,
  '3xl':64,
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
    shadowColor:   '#1A56FF',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius:  12,
    elevation:     8,
  },
  elevated: {
    shadowColor:   '#000000',
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius:  16,
    elevation:     12,
  },
};
