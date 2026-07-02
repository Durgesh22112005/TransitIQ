// =============================================================
// src/components/TripButton.jsx – Driver App
// Start / Stop trip button (UI only in Phase 1)
// =============================================================

import React, { useRef } from 'react';
import { Animated, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';

/**
 * TripButton
 * @param {boolean}  started  - whether the trip has been started
 * @param {Function} onPress  - callback when button is tapped
 */
const TripButton = ({ started, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn  = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true }).start();

  const colors = started
    ? [COLORS.danger, '#C0392B']
    : [COLORS.success, '#1A8A48'];

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <TouchableOpacity
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <LinearGradient colors={colors} style={styles.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>{started ? '⏹️' : '▶️'}</Text>
          </View>
          <View>
            <Text style={styles.label}>{started ? 'End Trip' : 'Start Trip'}</Text>
            <Text style={styles.sublabel}>{started ? 'Tap to end current trip' : 'Tap to begin your route'}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
    ...SHADOWS.elevated,
  },
  iconCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  icon:     { fontSize: 22 },
  label:    { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.textPrimary },
  sublabel: { fontSize: TYPOGRAPHY.sizes.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
});

export default TripButton;
