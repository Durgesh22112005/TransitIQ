import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { COLORS, GLASS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';

const CONFIG = {
  connected:    { label: 'Connected',    color: COLORS.success },
  disconnected: { label: 'Disconnected', color: COLORS.danger },
  connecting:   { label: 'Connecting...',color: COLORS.warning },
  error:        { label: 'Error',        color: COLORS.danger },
};

const STATUS_CONFIG = {
  active:   { label: 'GPS Active',   color: COLORS.success },
  inactive: { label: 'GPS Inactive', color: COLORS.textMuted },
  error:    { label: 'GPS Error',    color: COLORS.danger },
};

const StatusIndicator = ({ type = 'connection', status = 'disconnected' }) => {
  const config = type === 'gps' ? STATUS_CONFIG : CONFIG;
  const current = config[status] || config.disconnected;

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status !== 'connected' && status !== 'active') return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [status]);

  return (
    <View style={[styles.indicator, { backgroundColor: current.color + '12', borderColor: current.color + '20' }]}>
      <View style={styles.dotContainer}>
        <Animated.View
          style={[
            styles.pulseRing,
            {
              backgroundColor: current.color + '20',
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
        <View style={[styles.dot, { backgroundColor: current.color }]} />
      </View>
      <Text style={[styles.label, { color: current.color }]}>{current.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 1,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    gap: SPACING.xs + 2,
  },
  dotContainer: {
    width: 10,
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: 0.3,
  },
});

export default StatusIndicator;
