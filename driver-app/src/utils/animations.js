import { Animated, Easing } from 'react-native';
import { ANIMATION } from '../constants/theme';

export const fadeIn = (value, duration = ANIMATION.fadeIn) =>
  Animated.timing(value, {
    toValue: 1,
    duration,
    useNativeDriver: true,
  });

export const fadeOut = (value, duration = ANIMATION.fadeOut) =>
  Animated.timing(value, {
    toValue: 0,
    duration,
    useNativeDriver: true,
  });

export const slideUp = (value, distance = 24, duration = ANIMATION.slideUp) =>
  Animated.timing(value, {
    toValue: 0,
    duration,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  });

export const slideDown = (value, distance = 24, duration = ANIMATION.slideDown) =>
  Animated.timing(value, {
    toValue: 0,
    duration,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  });

export const scaleIn = (value, duration = ANIMATION.fadeIn) =>
  Animated.timing(value, {
    toValue: 1,
    duration,
    easing: Easing.out(Easing.back(1.5)),
    useNativeDriver: true,
  });

export const springPress = (value, toValue = 0.96) =>
  Animated.spring(value, {
    toValue,
    ...ANIMATION.springSnappy,
    useNativeDriver: true,
  });

export const springRelease = (value) =>
  Animated.spring(value, {
    toValue: 1,
    ...ANIMATION.springConfig,
    useNativeDriver: true,
  });

export const pulse = (value, scaleTo = 1.03) => {
  return Animated.sequence([
    Animated.timing(value, {
      toValue: scaleTo,
      duration: 800,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: 1,
      duration: 800,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: true,
    }),
  ]);
};

export const staggerDelay = (index, baseDelay = ANIMATION.staggerDelay) =>
  index * baseDelay;

export const createEntranceAnimation = (index = 0, config = {}) => {
  const {
    fadeDuration = ANIMATION.fadeIn,
    slideDistance = 20,
    slideDuration = ANIMATION.slideUp,
    delay = staggerDelay(index),
  } = config;

  const opacity = new Animated.Value(0);
  const translateY = new Animated.Value(slideDistance);

  const animation = Animated.parallel([
    Animated.timing(opacity, {
      toValue: 1,
      duration: fadeDuration,
      delay,
      useNativeDriver: true,
    }),
    Animated.timing(translateY, {
      toValue: 0,
      duration: slideDuration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
  ]);

  return { opacity, translateY, animation };
};

export const createStaggeredAnimations = (count, config = {}) => {
  return Array.from({ length: count }, (_, i) =>
    createEntranceAnimation(i, config)
  );
};
