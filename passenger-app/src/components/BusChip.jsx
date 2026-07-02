// =============================================================
// src/components/BusChip.jsx – Passenger App
// Filter chip for route status / categories
// =============================================================

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';

/**
 * BusChip
 * @param {string}   label   - chip text
 * @param {boolean}  active  - whether chip is selected
 * @param {Function} onPress - tap handler
 */
const BusChip = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.chip, active && styles.chipActive]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary + '33',
    borderColor: COLORS.primary,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  labelActive: {
    color: COLORS.primaryLight,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});

export default BusChip;
