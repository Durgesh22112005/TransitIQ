import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, SHADOWS, ANIMATION } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const { user, loading } = useAuth();
  const [animDone, setAnimDone] = React.useState(false);

  const logoScale   = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const iconRotate  = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textSlideY  = useRef(new Animated.Value(20)).current;
  const lineWidth   = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  const circleScale = useRef(new Animated.Value(0)).current;
  const circle2Scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(circleScale, {
        toValue: 1,
        tension: 30,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(circle2Scale, {
        toValue: 1,
        tension: 30,
        friction: 7,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(iconRotate, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(textSlideY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(lineWidth, {
        toValue: 100,
        duration: 500,
        useNativeDriver: false,
      }),
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setAnimDone(true);
    });

    const fallback = setTimeout(() => {
      setAnimDone(true);
    }, 1400);
    return () => clearTimeout(fallback);
  }, []);

  useEffect(() => {
    if (animDone && !loading) {
      navigation.replace(user ? 'MainTabs' : 'Login');
    }
  }, [animDone, loading, user, navigation]);

  const iconSpin = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-45deg', '0deg'],
  });

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Animated.View
        style={[
          styles.circle,
          styles.circleTopRight,
          { transform: [{ scale: circleScale }] },
        ]}
      />
      <Animated.View
        style={[
          styles.circle,
          styles.circleBottomLeft,
          { transform: [{ scale: circle2Scale }] },
        ]}
      />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }, { rotate: iconSpin }],
            },
          ]}
        >
          <LinearGradient
            colors={GRADIENTS.primary}
            style={styles.logoGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="bus" size={44} color={COLORS.textWhite} />
          </LinearGradient>
        </Animated.View>

        <Animated.View
          style={{
            opacity: textOpacity,
            transform: [{ translateY: textSlideY }],
            alignItems: 'center',
          }}
        >
          <Text style={styles.brandName}>TransitIQ</Text>
          <Text style={styles.brandTagline}>Driver Portal</Text>
          <Animated.View style={[styles.accentLine, { width: lineWidth }]} />
        </Animated.View>
      </View>

      <Animated.Text style={[styles.footer, { opacity: footerOpacity }]}>
        Intelligent Public Transit
      </Animated.Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.06,
    backgroundColor: COLORS.primary,
  },
  circleTopRight: {
    width: 300, height: 300,
    top: -80, right: -80,
  },
  circleBottomLeft: {
    width: 250, height: 250,
    bottom: -60, left: -60,
    backgroundColor: COLORS.accent,
  },
  content: {
    alignItems: 'center',
    gap: SPACING.lg,
  },
  logoContainer: {
    marginBottom: SPACING.sm,
  },
  logoGradient: {
    width: 96,
    height: 96,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.glow,
  },
  brandName: {
    fontSize: TYPOGRAPHY.sizes['4xl'],
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },
  brandTagline: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.primaryLight,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: SPACING.xs,
  },
  accentLine: {
    height: 3,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 99,
    marginTop: SPACING.md,
  },
  footer: {
    position: 'absolute',
    bottom: SPACING['2xl'],
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textMuted,
    letterSpacing: 2,
  },
});

export default SplashScreen;
