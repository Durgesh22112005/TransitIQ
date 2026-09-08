import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import Button from './Button';

const statusConfig = {
  SCHEDULED:   { label: 'Scheduled',   dot: COLORS.warning, bg: COLORS.warningBg, text: COLORS.warning },
  IN_PROGRESS: { label: 'In Progress', dot: COLORS.success, bg: COLORS.successBg, text: COLORS.success },
  COMPLETED:   { label: 'Completed',   dot: COLORS.textMuted, bg: COLORS.surfaceLight, text: COLORS.textSecondary },
  CANCELLED:   { label: 'Cancelled',   dot: COLORS.danger,  bg: COLORS.dangerBg,  text: COLORS.danger },
};

const formatTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

const TripCard = ({ trip, onStart, onEnd, starting }) => {
  if (!trip) {
    return (
      <View style={styles.card}>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <Text style={styles.emptyIcon}>🚌</Text>
          </View>
          <Text style={styles.emptyTitle}>No Trip Assigned</Text>
          <Text style={styles.emptySubtitle}>You don't have any active trips scheduled.</Text>
        </View>
      </View>
    );
  }

  const cfg = statusConfig[trip.status] || statusConfig.SCHEDULED;
  const isActive = trip.status === 'IN_PROGRESS';
  const isScheduled = trip.status === 'SCHEDULED';

  return (
    <View style={styles.card}>
      <View style={[styles.statusBar, { backgroundColor: cfg.dot }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.routeNo}>{trip.route?.routeNo || '—'}</Text>
            <Text style={styles.routeName} numberOfLines={1}>{trip.route?.name || 'Unknown Route'}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: cfg.dot }]} />
            <Text style={[styles.statusLabel, { color: cfg.text }]}>{cfg.label}</Text>
          </View>
        </View>

        {isActive && (
          <View style={styles.activeBanner}>
            <Text style={styles.activeIcon}>🟢</Text>
            <Text style={styles.activeText}>Live — Started at {formatTime(trip.actualStart)}</Text>
          </View>
        )}

        <View style={styles.endpoints}>
          <View style={styles.endpointCol}>
            <View style={styles.endpointMarker}>
              <View style={[styles.endpointDot, { backgroundColor: COLORS.success }]}>
                <View style={styles.endpointInner} />
              </View>
              <View style={styles.endpointLine} />
            </View>
            <View style={styles.endpointInfo}>
              <Text style={styles.endpointLabel}>FROM</Text>
              <Text style={styles.endpointText}>{trip.route?.startLocation || '—'}</Text>
            </View>
          </View>
          {trip.route?.stops?.slice(0, 3).map((stop, i) => (
            <View key={stop.id || i} style={styles.endpointCol}>
              <View style={styles.endpointMarker}>
                <View style={styles.intermediateDot} />
                <View style={styles.endpointLine} />
              </View>
              <View style={styles.endpointInfo}>
                <Text style={styles.endpointLabel}>STOP {stop.sequence}</Text>
                <Text style={styles.endpointText} numberOfLines={1}>{stop.name}</Text>
              </View>
            </View>
          ))}
          {trip.route?.stops?.length > 3 && (
            <View style={styles.endpointCol}>
              <View style={styles.endpointMarker}>
                <View style={styles.intermediateDot} />
                <View style={styles.endpointLine} />
              </View>
              <View style={styles.endpointInfo}>
                <Text style={styles.endpointLabel}>+{trip.route.stops.length - 3} more</Text>
              </View>
            </View>
          )}
          <View style={styles.endpointCol}>
            <View style={styles.endpointMarker}>
              <View style={[styles.endpointDot, { backgroundColor: COLORS.danger }]}>
                <View style={[styles.endpointInner, { backgroundColor: COLORS.danger }]} />
              </View>
            </View>
            <View style={styles.endpointInfo}>
              <Text style={styles.endpointLabel}>TO</Text>
              <Text style={styles.endpointText}>{trip.route?.endLocation || '—'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>📅</Text>
            <Text style={styles.detailLabel}>Schedule</Text>
            <Text style={styles.detailValue}>{formatTime(trip.scheduledStart)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>🚌</Text>
            <Text style={styles.detailLabel}>Bus</Text>
            <Text style={styles.detailValue}>{trip.bus?.regNo || trip.driver?.assignedBus?.regNo || '—'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>🚏</Text>
            <Text style={styles.detailLabel}>Stops</Text>
            <Text style={styles.detailValue}>{trip.route?.stops?.length || 0}</Text>
          </View>
          {trip.route?.distance && (
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>📏</Text>
              <Text style={styles.detailLabel}>Distance</Text>
              <Text style={styles.detailValue}>{trip.route.distance} km</Text>
            </View>
          )}
          {trip.route?.duration && (
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>⏱️</Text>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{trip.route.duration} min</Text>
            </View>
          )}
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>👤</Text>
            <Text style={styles.detailLabel}>Driver</Text>
            <Text style={styles.detailValue} numberOfLines={1}>{trip.driver?.user?.name || '—'}</Text>
          </View>
        </View>

        {trip.driver?.assignedBus && !trip.bus && (
          <>
            <View style={styles.divider} />
            <View style={styles.busSection}>
              <Text style={styles.busLabel}>ASSIGNED BUS</Text>
              <Text style={styles.busReg}>{trip.driver.assignedBus.regNo}</Text>
              <Text style={styles.busModel}>{trip.driver.assignedBus.model}</Text>
            </View>
          </>
        )}
      </View>

      {(isActive || isScheduled) && (
        <View style={styles.footer}>
          {isActive ? (
            <Button
              title="End Trip"
              onPress={onEnd}
              variant="danger"
              icon="⏹️"
            />
          ) : (
            <Button
              title={starting ? 'Starting...' : 'Start Trip'}
              onPress={onStart}
              variant="success"
              icon="▶️"
              loading={starting}
              disabled={starting}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
    overflow: 'hidden',
  },
  statusBar: { height: 4 },
  content: { padding: SPACING.md, gap: SPACING.md },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: { flex: 1, marginRight: SPACING.sm },
  routeNo: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.primary,
  },
  routeName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusLabel: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold },

  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successBg,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  activeIcon: { fontSize: 12 },
  activeText: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.success, fontWeight: TYPOGRAPHY.weights.semibold },

  endpoints: { gap: 0 },
  endpointCol: { flexDirection: 'row', minHeight: 48 },
  endpointMarker: { alignItems: 'center', width: 24, marginRight: SPACING.sm },
  endpointDot: {
    width: 16, height: 16, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  endpointInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.surface },
  intermediateDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.textMuted },
  endpointLine: { width: 2, flex: 1, backgroundColor: COLORS.border, marginVertical: 2 },
  endpointInfo: { flex: 1, justifyContent: 'center', paddingBottom: SPACING.sm },
  endpointLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  endpointText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginTop: 1,
  },

  divider: { height: 1, backgroundColor: COLORS.border + '66' },

  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  detailItem: {
    width: '30%',
    flexGrow: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    alignItems: 'center',
    gap: 2,
  },
  detailIcon: { fontSize: 16 },
  detailLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontVariant: ['tabular-nums'],
  },

  busSection: { alignItems: 'center', gap: 2 },
  busLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  busReg: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  busModel: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.textSecondary },

  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.sm,
  },

  emptyState: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.sm },
  emptyIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center', alignItems: 'center',
  },
  emptyIcon: { fontSize: 32 },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textSecondary,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
});

export default TripCard;
