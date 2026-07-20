import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';

const LoadingOverlay = ({ message }) => (
  <View style={styles.overlay}>
    <View style={styles.card}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  </View>
);

const LoadingSpinner = ({ size = 'large', color = COLORS.primary, style }) => (
  <View style={[styles.spinnerContainer, style]}>
    <ActivityIndicator size={size} color={color} />
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
    minWidth: 140,
  },
  message: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  spinnerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
});

export { LoadingOverlay, LoadingSpinner };
