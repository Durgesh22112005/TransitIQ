import React, { useRef } from 'react';
import {
  TouchableOpacity, Text, StyleSheet, Animated, ActivityIndicator, View, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, GLASS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import GlassView from './GlassView';

const Button = ({
  title, onPress, loading, disabled, variant = 'primary',
  icon, style, textStyle, gradientColors, size = 'md',
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.96, tension: 100, friction: 8, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }).start();
  };

  const getGradientColors = () => {
    if (gradientColors) return gradientColors;
    switch (variant) {
      case 'danger': return GRADIENTS.danger;
      case 'success': return GRADIENTS.success;
      case 'accent': return GRADIENTS.accent;
      case 'outline': return ['transparent', 'transparent'];
      case 'ghost': return ['transparent', 'transparent'];
      default: return GRADIENTS.primary;
    }
  };

  const isDisabled = disabled || loading;

  const sizeStyles = {
    sm: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, minHeight: 40 },
    md: { paddingVertical: SPACING.sm + 4, paddingHorizontal: SPACING.lg, minHeight: 48 },
    lg: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, minHeight: 56 },
  };

  const textSizeStyles = {
    sm: TYPOGRAPHY.sizes.sm,
    md: TYPOGRAPHY.sizes.md,
    lg: TYPOGRAPHY.sizes.lg,
  };

  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';
  const isGlass = variant === 'glass';

  const content = (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isOutline || isGhost ? COLORS.primary : isGlass ? COLORS.textWhite : COLORS.textWhite}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={[
            styles.text,
            { fontSize: textSizeStyles[size] || TYPOGRAPHY.sizes.md },
            isOutline && styles.outlineText,
            isGhost && styles.ghostText,
            isGlass && styles.glassText,
            textStyle,
          ]}>{title}</Text>
        </View>
      )}
    </View>
  );

  if (isGlass) {
    return (
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        <TouchableOpacity
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onPress={onPress}
          activeOpacity={0.85}
          disabled={isDisabled}
        >
          <GlassView
            intensity={40}
            tint="dark"
            style={[
              styles.button,
              sizeStyles[size] || sizeStyles.md,
              styles.glassButton,
              isDisabled && styles.disabled,
            ]}
          >
            {content}
          </GlassView>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        activeOpacity={0.85}
        disabled={isDisabled}
      >
        <LinearGradient
          colors={getGradientColors()}
          style={[
            styles.button,
            sizeStyles[size] || sizeStyles.md,
            isOutline && styles.outlineButton,
            isGhost && styles.ghostButton,
            isDisabled && styles.disabled,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  glassButton: {
    borderWidth: 1,
    borderColor: GLASS.borderLight,
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  icon: {
    fontSize: 16,
  },
  text: {
    color: COLORS.textWhite,
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: 0.3,
  },
  outlineText: {
    color: COLORS.primary,
  },
  ghostText: {
    color: COLORS.primaryLight,
  },
  glassText: {
    color: COLORS.textWhite,
  },
});

export default Button;
