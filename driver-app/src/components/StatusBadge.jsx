// =============================================================
// src/components/StatusBadge.jsx – Driver App
// =============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';

/**
 * StatusBadge – coloured pill label
 * @param {string} label - text to display
 * @param {string} color - badge accent color (defaults to primary)
 */
const StatusBadge = ({ label, color = COLORS.primary }) => (
  <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color + '66' }]}>
    <View style={[styles.dot, { backgroundColor: color }]} />
    <Text style={[styles.text, { color }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});

export default StatusBadge;
