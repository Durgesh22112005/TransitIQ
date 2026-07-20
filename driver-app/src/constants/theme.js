export const COLORS = {
  primary:      '#2563EB',
  primaryDark:  '#1D4ED8',
  primaryLight: '#60A5FA',
  primaryBg:    '#1E2A4A',

  success:      '#10B981',
  successBg:    '#0A2E1E',
  warning:      '#F59E0B',
  warningBg:    '#2A200A',
  danger:       '#EF4444',
  dangerBg:     '#2E0A0A',
  info:         '#3B82F6',

  background:   '#0A0E1A',
  surface:      '#131826',
  surfaceLight: '#1A2035',
  border:       '#252D45',
  borderLight:  '#1E2640',

  textPrimary:  '#F1F5F9',
  textSecondary:'#94A3B8',
  textMuted:    '#64748B',
  textWhite:    '#FFFFFF',

  tabInactive:  '#475569',
  tabActive:    '#60A5FA',
};

export const TYPOGRAPHY = {
  sizes: {
    xs:   11,
    sm:   13,
    md:   15,
    lg:   17,
    xl:   20,
    '2xl':24,
    '3xl':30,
    '4xl':36,
  },
  weights: {
    regular: '400',
    medium:  '500',
    semibold:'600',
    bold:    '700',
    black:   '800',
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
  xl:   20,
  '2xl':24,
  full: 9999,
};

export const SHADOWS = {
  card: {
    shadowColor: '#000000',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius:  12,
    elevation:     5,
  },
  elevated: {
    shadowColor: '#000000',
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius:  16,
    elevation:     8,
  },
  button: {
    shadowColor: '#2563EB',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius:  10,
    elevation:     5,
  },
};
