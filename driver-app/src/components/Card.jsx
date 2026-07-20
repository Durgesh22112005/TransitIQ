import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/theme';

const Card = ({ children, style, padding = SPACING.md }) => (
  <View style={[styles.card, { padding }, style]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
});

export default Card;
