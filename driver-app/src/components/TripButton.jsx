import React, { useRef } from 'react';
import { Animated, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const TripButton = ({ started, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn  = () => Animated.spring(scale, { toValue: 0.96, tension: 100, friction: 8, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }).start();

  const colors = started ? GRADIENTS.danger : GRADIENTS.success;

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <TouchableOpacity
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <LinearGradient colors={colors} style={styles.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>{started ? '⏹️' : '▶️'}</Text>
          </View>
          <View style={styles.textGroup}>
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
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  icon: { fontSize: 20 },
  textGroup: { flex: 1 },
  label: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  sublabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
});

export default TripButton;
