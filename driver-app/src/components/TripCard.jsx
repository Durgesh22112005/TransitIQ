import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import StatusBadge from './StatusBadge';

const TripCard = ({ trip }) => {
  if (!trip) {
    return (
      <View style={styles.card}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🚌</Text>
          <Text style={styles.emptyTitle}>No Trip Assigned</Text>
          <Text style={styles.emptySubtitle}>You don't have any active trips scheduled.</Text>
        </View>
      </View>
    );
  }

  const statusColor = {
    SCHEDULED: COLORS.warning,
    IN_PROGRESS: COLORS.primary,
    COMPLETED: COLORS.success,
    CANCELLED: COLORS.textMuted,
  }[trip.status] || COLORS.primary;

  const formatTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.routeInfo}>
          <Text style={styles.routeNo}>{trip.route?.routeNo || '—'}</Text>
          <Text style={styles.routeName} numberOfLines={1}>{trip.route?.name || 'Unknown Route'}</Text>
        </View>
        <StatusBadge label={trip.status} color={statusColor} />
      </View>

      <View style={styles.endpoints}>
        <View style={styles.endpoint}>
          <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
          <Text style={styles.endpointText}>{trip.route?.startLocation || '—'}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.endpoint}>
          <View style={[styles.dot, { backgroundColor: COLORS.danger }]} />
          <Text style={styles.endpointText}>{trip.route?.endLocation || '—'}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Schedule</Text>
          <Text style={styles.metaValue}>{formatTime(trip.scheduledStart)}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Bus</Text>
          <Text style={styles.metaValue}>{trip.bus?.regNo || trip.driver?.assignedBus?.regNo || '—'}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Stops</Text>
          <Text style={styles.metaValue}>{trip.route?.stops?.length || 0}</Text>
        </View>
      </View>

      {trip.status === 'IN_PROGRESS' && trip.actualStart && (
        <View style={styles.activeBanner}>
          <Text style={styles.activeText}>
            Started at {formatTime(trip.actualStart)}
          </Text>
        </View>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  routeInfo: { flex: 1, marginRight: SPACING.sm },
  routeNo: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.primary,
  },
  routeName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  endpoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  endpoint: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  routeLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  endpointText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border + '44',
  },
  metaItem: { alignItems: 'center' },
  metaLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginTop: 2,
  },
  activeBanner: {
    backgroundColor: COLORS.primary + '22',
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  activeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textSecondary,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

export default TripCard;
