import React, { useRef } from 'react';
import {
  TouchableOpacity, Text, StyleSheet, Animated, ActivityIndicator, View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const Button = ({
  title, onPress, loading, disabled, variant = 'primary',
  icon, style, textStyle, gradientColors,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  const getGradientColors = () => {
    if (gradientColors) return gradientColors;
    switch (variant) {
      case 'danger': return [COLORS.danger, '#DC2626'];
      case 'success': return [COLORS.success, '#059669'];
      case 'outline': return ['transparent', 'transparent'];
      default: return [COLORS.primary, COLORS.primaryDark];
    }
  };

  const isDisabled = disabled || loading;

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        activeOpacity={0.9}
        disabled={isDisabled}
      >
        <LinearGradient
          colors={getGradientColors()}
          style={[
            styles.button,
            variant === 'outline' && styles.outlineButton,
            isDisabled && styles.disabled,
          ]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        >
          {loading ? (
            <ActivityIndicator size="small" color={variant === 'outline' ? COLORS.primary : COLORS.textWhite} />
          ) : (
            <View style={styles.content}>
              {icon && <Text style={styles.icon}>{icon}</Text>}
              <Text style={[
                styles.text,
                variant === 'outline' && styles.outlineText,
                textStyle,
              ]}>{title}</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    ...SHADOWS.button,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  icon: {
    fontSize: 18,
  },
  text: {
    color: COLORS.textWhite,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  outlineText: {
    color: COLORS.primary,
  },
});

export default Button;
