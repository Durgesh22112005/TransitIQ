import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';

const isWeb = Platform.OS === 'web';

const GlassView = ({
  children,
  intensity = 40,
  tint = 'dark',
  style,
  ...props
}) => {
  return (
    <View style={[styles.glass, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
});

export default GlassView;
