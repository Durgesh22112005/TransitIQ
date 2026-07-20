import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';

const CONFIG = {
  connected: { label: 'Connected', color: COLORS.success, icon: '\uD83D\uDFE2' },
  disconnected: { label: 'Disconnected', color: COLORS.danger, icon: '\uD83D\uDD34' },
  connecting: { label: 'Connecting...', color: COLORS.warning, icon: '\uD83D\uDFE1' },
  error: { label: 'Connection Error', color: COLORS.danger, icon: '\u274C' },
};

const STATUS_CONFIG = {
  active: { label: 'GPS Active', color: COLORS.success, icon: '\uD83D\uDCCD' },
  inactive: { label: 'GPS Inactive', color: COLORS.textMuted, icon: '\u26A0\uFE0F' },
  error: { label: 'GPS Error', color: COLORS.danger, icon: '\u274C' },
};

const StatusIndicator = ({ type = 'connection', status = 'disconnected' }) => {
  const config = type === 'gps' ? STATUS_CONFIG : CONFIG;
  const current = config[status] || config.disconnected;

  return (
    <View style={[styles.indicator, { borderColor: current.color + '44' }]}>
      <View style={[styles.dot, { backgroundColor: current.color }]} />
      <Text style={[styles.label, { color: current.color }]}>{current.icon} {current.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    gap: SPACING.xs,
    backgroundColor: COLORS.surface,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});

export default StatusIndicator;
