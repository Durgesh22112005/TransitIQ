// =============================================================
// src/screens/SplashScreen.jsx – Driver App
// =============================================================

import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const { user, loading } = useAuth();

  // Animation values
  const logoScale   = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const lineWidth   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence: scale logo → fade text → slide line → navigate
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1, tension: 80, friction: 6, useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1, duration: 600, useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1, duration: 500, delay: 100, useNativeDriver: true,
      }),
      Animated.timing(lineWidth, {
        toValue: 120, duration: 600, useNativeDriver: false,
      }),
    ]).start(() => {
      // Wait for auth check then navigate
      const timer = setTimeout(() => {
        if (!loading) {
          navigation.replace(user ? 'Dashboard' : 'Login');
        }
      }, 800);
      return () => clearTimeout(timer);
    });
  }, [loading]);

  return (
    <LinearGradient
      colors={[COLORS.background, '#0D1B3E', COLORS.background]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Decorative circles */}
      <View style={[styles.circle, styles.circleTopRight]} />
      <View style={[styles.circle, styles.circleBottomLeft]} />

      <View style={styles.content}>
        {/* Logo mark */}
        <Animated.View
          style={[
            styles.logoContainer,
            { transform: [{ scale: logoScale }], opacity: logoOpacity },
          ]}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.accent]}
            style={styles.logoGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.logoIcon}>🚌</Text>
          </LinearGradient>
        </Animated.View>

        {/* Brand name */}
        <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
          <Text style={styles.brandName}>TransitIQ</Text>
          <Text style={styles.brandTagline}>Driver Portal</Text>

          <Animated.View style={[styles.accentLine, { width: lineWidth }]} />
        </Animated.View>
      </View>

      {/* Footer */}
      <Animated.Text style={[styles.footer, { opacity: textOpacity }]}>
        Intelligent Public Transit
      </Animated.Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.06,
    backgroundColor: COLORS.primary,
  },
  circleTopRight: {
    width: 300, height: 300,
    top: -80, right: -80,
  },
  circleBottomLeft: {
    width: 250, height: 250,
    bottom: -60, left: -60,
    backgroundColor: COLORS.accent,
  },
  content: {
    alignItems: 'center',
    gap: SPACING.lg,
  },
  logoContainer: {
    marginBottom: SPACING.md,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 50,
  },
  brandName: {
    fontSize: TYPOGRAPHY.sizes['4xl'],
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },
  brandTagline: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.accent,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: SPACING.xs,
  },
  accentLine: {
    height: 3,
    backgroundColor: COLORS.accent,
    borderRadius: 99,
    marginTop: SPACING.md,
  },
  footer: {
    position: 'absolute',
    bottom: SPACING['2xl'],
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textMuted,
    letterSpacing: 2,
  },
});

export default SplashScreen;
