// =============================================================
// src/screens/SplashScreen.jsx – Passenger App
// =============================================================

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const SplashScreen = ({ navigation }) => {
  const { user, loading } = useAuth();

  const [animDone, setAnimDone] = React.useState(false);
  const scale    = useRef(new Animated.Value(0)).current;
  const opacity  = useRef(new Animated.Value(0)).current;
  const slideUp  = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale,   { toValue: 1, tension: 70, friction: 6, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
      Animated.spring(slideUp, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
    ]).start(() => {
      setAnimDone(true);
    });

    const fallback = setTimeout(() => {
      setAnimDone(true);
    }, 1200);
    return () => clearTimeout(fallback);
  }, []);

  useEffect(() => {
    if (animDone && !loading) {
      navigation.replace(user ? 'Home' : 'Login');
    }
  }, [animDone, loading, user, navigation]);

  return (
    <LinearGradient
      colors={['#09090F', '#1A0A3E', '#09090F']}
      style={styles.container}
      start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}
    >
      <View style={[styles.glow, styles.glowTop]} />
      <View style={[styles.glow, styles.glowBottom]} />

      <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.accent]}
          style={styles.logoBox}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <Text style={styles.logoIcon}>🚏</Text>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[styles.textBox, { opacity, transform: [{ translateY: slideUp }] }]}>
        <Text style={styles.brand}>TransitIQ</Text>
        <Text style={styles.tagline}>Your City. Your Ride.</Text>
        <View style={styles.pill}>
          <Text style={styles.pillText}>Passenger</Text>
        </View>
      </Animated.View>

      <Animated.Text style={[styles.footer, { opacity }]}>
        Plan. Ride. Arrive.
      </Animated.Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  glow: {
    position: 'absolute',
    width: 280, height: 280, borderRadius: 140,
    opacity: 0.08,
  },
  glowTop:    { backgroundColor: COLORS.primary, top: -80, right: -60 },
  glowBottom: { backgroundColor: COLORS.accent,  bottom: -80, left: -60 },
  content:    { alignItems: 'center', marginBottom: SPACING.lg },
  logoBox: {
    width: 110, height: 110, borderRadius: 32,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6, shadowRadius: 20, elevation: 16,
  },
  logoIcon: { fontSize: 56 },
  textBox:  { alignItems: 'center', gap: SPACING.sm },
  brand:    { fontSize: TYPOGRAPHY.sizes['4xl'], fontWeight: TYPOGRAPHY.weights.black, color: COLORS.textPrimary, letterSpacing: 2 },
  tagline:  { fontSize: TYPOGRAPHY.sizes.lg, color: COLORS.textSecondary },
  pill: {
    backgroundColor: COLORS.primary + '33',
    borderRadius: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.primary + '66',
  },
  pillText: { color: COLORS.primaryLight, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold, letterSpacing: 2, textTransform: 'uppercase' },
  footer: {
    position: 'absolute', bottom: SPACING['2xl'],
    color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs, letterSpacing: 2,
  },
});

export default SplashScreen;
