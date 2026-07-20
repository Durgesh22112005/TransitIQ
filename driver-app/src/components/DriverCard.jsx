import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import StatusBadge from './StatusBadge';

const DriverCard = ({ driver, user }) => {
  if (!driver) return null;

  const statusColor = {
    ACTIVE: COLORS.success,
    INACTIVE: COLORS.textMuted,
    ON_LEAVE: COLORS.warning,
  }[driver.status] || COLORS.primary;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.[0]?.toUpperCase() || 'D'}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{user?.name || 'Driver'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
        </View>
        <StatusBadge label={driver.status} color={statusColor} />
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>License</Text>
          <Text style={styles.detailValue}>{driver.licenseNo}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Experience</Text>
          <Text style={styles.detailValue}>{driver.experience} years</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
    gap: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  headerInfo: { flex: 1 },
  name: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  email: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  details: { gap: SPACING.xs },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '44',
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textMuted,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});

export default DriverCard;
