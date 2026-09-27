export const COLORS = {
  primary:      '#2563EB',
  primaryDark:  '#1D4ED8',
  primaryLight: '#60A5FA',
  primaryBg:    '#1E2A4A',

  accent:       '#8B5CF6',
  accentDark:   '#7C3AED',

  success:      '#10B981',
  successDark:  '#059669',
  successBg:    '#0A2E1E',
  warning:      '#F59E0B',
  warningDark:  '#D97706',
  warningBg:    '#2A200A',
  danger:       '#EF4444',
  dangerDark:   '#DC2626',
  dangerBg:     '#2E0A0A',
  info:         '#3B82F6',

  background:   '#060A14',
  surface:      '#0E1424',
  surfaceLight: '#151D33',
  surfaceGlass: 'rgba(14, 20, 36, 0.55)',
  border:       '#1A2440',
  borderLight:  '#131B30',
  borderFocus:  '#2563EB',

  textPrimary:  '#F1F5F9',
  textSecondary:'#94A3B8',
  textMuted:    '#64748B',
  textWhite:    '#FFFFFF',
  textInverse:  '#0F172A',

  tabInactive:  '#475569',
  tabActive:    '#60A5FA',

  overlay:      'rgba(0, 0, 0, 0.5)',
  shimmer:      'rgba(255, 255, 255, 0.04)',
};

export const GLASS = {
  bgLight:      'rgba(255, 255, 255, 0.06)',
  bgMedium:     'rgba(255, 255, 255, 0.08)',
  bgStrong:     'rgba(255, 255, 255, 0.12)',
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  borderLight:  'rgba(255, 255, 255, 0.12)',
  borderMedium: 'rgba(255, 255, 255, 0.18)',
  highlight:    'rgba(255, 255, 255, 0.15)',
  shadow:       'rgba(0, 0, 0, 0.3)',
  tabBg:        'rgba(10, 14, 26, 0.75)',
  headerBg:     'rgba(10, 14, 26, 0.4)',
  inputBg:      'rgba(255, 255, 255, 0.05)',
  inputBgFocus: 'rgba(255, 255, 255, 0.08)',
  cardBg:       'rgba(14, 20, 36, 0.6)',
  buttonBg:     'rgba(255, 255, 255, 0.06)',
};

export const GRADIENTS = {
  primary:    [COLORS.primary, COLORS.primaryDark],
  accent:     [COLORS.accent, COLORS.accentDark],
  success:    [COLORS.success, COLORS.successDark],
  danger:     [COLORS.danger, COLORS.dangerDark],
  header:     [COLORS.primary, COLORS.primaryDark],
  background: ['#060A14', '#0C1225'],
  surface:    [COLORS.surface, COLORS.surfaceLight],
  glass:      ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)'],
  glassBorder:['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)'],
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
    '5xl':42,
  },
  weights: {
    regular: '400',
    medium:  '500',
    semibold:'600',
    bold:    '700',
    black:   '800',
  },
  lineHeights: {
    tight:   1.2,
    normal:  1.5,
    relaxed: 1.75,
  },
};

export const SPACING = {
  xxs:  2,
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  '2xl':48,
  '3xl':64,
  '4xl':80,
};

export const RADIUS = {
  xs:   6,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl':24,
  '3xl':32,
  full: 9999,
};

export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  subtle: {
    shadowColor: '#000000',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius:  8,
    elevation:     2,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius:  16,
    elevation:     5,
  },
  glass: {
    shadowColor: '#000000',
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius:  24,
    elevation:     8,
  },
  elevated: {
    shadowColor: '#000000',
    shadowOffset:  { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius:  32,
    elevation:     10,
  },
  button: {
    shadowColor: '#2563EB',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius:  12,
    elevation:     5,
  },
  glow: {
    shadowColor: '#2563EB',
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius:  16,
    elevation:     6,
  },
};

export const ANIMATION = {
  fadeIn:          300,
  fadeInSlow:      500,
  fadeOut:         200,
  slideUp:         350,
  slideDown:       300,
  springConfig:    { tension: 60, friction: 8 },
  springFast:      { tension: 80, friction: 6 },
  springSnappy:    { tension: 100, friction: 8 },
  staggerDelay:    60,
  tabTransition:   200,
  pulseScale:      [1, 1.05, 1],
};
