import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, ANIMATION } from '../constants/theme';
import Button from './Button';

const ErrorState = ({ message, onRetry }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: ANIMATION.fadeInSlow,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: ANIMATION.fadeInSlow,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ scale }] }]}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>!</Text>
      </View>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{message || 'An unexpected error occurred. Please try again.'}</Text>
      {onRetry && (
        <Button title="Try Again" onPress={onRetry} variant="outline" size="sm" style={styles.button} />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.sm,
  },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: COLORS.dangerBg,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.danger + '30',
  },
  icon: {
    fontSize: 28,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.danger,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  message: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: { marginTop: SPACING.md, minWidth: 160 },
});

export default ErrorState;
