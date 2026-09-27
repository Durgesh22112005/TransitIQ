import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Easing, View, Platform } from 'react-native';
import { COLORS, GLASS, RADIUS, SHADOWS, SPACING, ANIMATION } from '../constants/theme';
import GlassView from './GlassView';

const Card = ({
  children,
  style,
  padding = SPACING.md,
  variant = 'glass',
  animate = true,
  delay = 0,
  blur = 30,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    if (!animate) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: ANIMATION.fadeIn,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: ANIMATION.slideUp,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const variantStyles = {
    glass: {
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.10)',
      overflow: 'hidden',
    },
    solid: {
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    elevated: {
      backgroundColor: COLORS.surface,
      borderWidth: 0,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    default: {
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.10)',
      overflow: 'hidden',
    },
  };

  const shadowStyle = variant === 'elevated'
    ? SHADOWS.elevated
    : variant === 'ghost'
    ? SHADOWS.none
    : variant === 'solid'
    ? SHADOWS.card
    : SHADOWS.glass;

  const currentVariant = variantStyles[variant] || variantStyles.glass;
  const useGlass = variant === 'glass' || variant === 'default';

  const content = (
    <View style={[styles.highlightBorder]} />
  );

  if (useGlass) {
    return (
      <Animated.View
        style={[
          {
            opacity,
            transform: [{ translateY }],
            borderRadius: RADIUS.lg,
          },
          shadowStyle,
          style,
        ]}
      >
        <GlassView
          intensity={blur}
          tint="dark"
          style={[
            styles.card,
            { padding },
            currentVariant,
          ]}
        >
          <View style={styles.highlightBorder} />
          {children}
        </GlassView>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.card,
        { padding },
        currentVariant,
        shadowStyle,
        {
          opacity,
          transform: [{ translateY }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
  },
  highlightBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: GLASS.highlight,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    zIndex: 1,
  },
});

export default Card;
