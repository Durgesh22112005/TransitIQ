import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { COLORS, GLASS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';

const StatusBadge = ({ label, color = COLORS.primary, pulse = false }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!pulse) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.4,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <View style={[styles.badge, { backgroundColor: color + '15', borderColor: color + '25' }]}>
      <Animated.View style={[styles.dotWrapper, { transform: [{ scale: pulseAnim }] }]}>
        <View style={[styles.dot, { backgroundColor: color }]} />
      </Animated.View>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    gap: SPACING.xs + 2,
  },
  dotWrapper: {
    width: 8,
    height: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: 0.5,
  },
});

export default StatusBadge;
