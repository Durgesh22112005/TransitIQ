import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import Button from './Button';

const EmptyState = ({ icon, title, message, actionLabel, onAction }) => (
  <View style={styles.container}>
    <Text style={styles.icon}>{icon || '📭'}</Text>
    <Text style={styles.title}>{title}</Text>
    {message && <Text style={styles.message}>{message}</Text>}
    {actionLabel && onAction && (
      <Button title={actionLabel} onPress={onAction} variant="outline" style={styles.button} />
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.sm,
  },
  icon: { fontSize: 56, marginBottom: SPACING.sm },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  message: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: { marginTop: SPACING.md, minWidth: 160 },
});

export default EmptyState;
