import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';

const GlassBackground = ({ children, style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.orbBlue} />
      <View style={styles.orbPurple} />
      <View style={styles.orbTeal} />
      <View style={styles.orbPink} />
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
  },
  orbBlue: {
    position: 'absolute',
    width: 400,
    height: 400,
    top: -100,
    right: -80,
    borderRadius: 200,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
  },
  orbPurple: {
    position: 'absolute',
    width: 350,
    height: 350,
    top: 200,
    left: -120,
    borderRadius: 175,
    backgroundColor: 'rgba(139, 92, 246, 0.10)',
  },
  orbTeal: {
    position: 'absolute',
    width: 300,
    height: 300,
    bottom: 150,
    right: -60,
    borderRadius: 150,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  orbPink: {
    position: 'absolute',
    width: 250,
    height: 250,
    bottom: -50,
    left: 50,
    borderRadius: 125,
    backgroundColor: 'rgba(236, 72, 153, 0.07)',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});

export default GlassBackground;
