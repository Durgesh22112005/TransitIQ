import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';
import Button from './Button';

const ErrorState = ({ message, onRetry }) => (
  <View style={styles.container}>
    <View style={styles.iconCircle}>
      <Text style={styles.icon}>!</Text>
    </View>
    <Text style={styles.title}>Something went wrong</Text>
    <Text style={styles.message}>{message || 'An unexpected error occurred. Please try again.'}</Text>
    {onRetry && (
      <Button title="Try Again" onPress={onRetry} variant="outline" style={styles.button} />
    )}
  </View>
);

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
  },
  icon: {
    fontSize: 28, fontWeight: '700', color: COLORS.danger,
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
