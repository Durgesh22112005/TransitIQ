import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { tripAPI } from '../services/api.service';

const StatusBadge = ({ status }) => {
  const live = status === 'IN_PROGRESS';
  return (
    <View style={[styles.statusPill, { backgroundColor: live ? COLORS.success + '22' : COLORS.warning + '22' }]}>
      <View style={[styles.statusDot, { backgroundColor: live ? COLORS.success : COLORS.warning }]} />
      <Text style={[styles.statusText, { color: live ? COLORS.success : COLORS.warning }]}>
        {live ? 'LIVE' : status}
      </Text>
    </View>
  );
};

const StopItem = ({ stop, isLast }) => (
  <View style={styles.stopRow}>
    <View style={styles.stopRail}>
      <View style={[styles.stopDot, isLast && styles.stopDotLast]} />
      {!isLast && <View style={styles.stopLine} />}
    </View>
    <View style={styles.stopContent}>
      <View style={styles.stopHeader}>
        <Text style={styles.stopName}>{stop.name}</Text>
        <Text style={styles.stopSeq}>#{stop.sequence}</Text>
      </View>
      {stop.landmark && <Text style={styles.stopLandmark}>{stop.landmark}</Text>}
    </View>
  </View>
);

export default function TripTrackerScreen({ route, navigation }) {
  const { tripId } = route?.params || {};
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId) { setLoading(false); return; }
    tripAPI.getById(tripId)
      .then((res) => setTrip(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tripId]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.loader}>
        <Text style={styles.notFound}>Trip not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBack}>
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const stops = trip.route?.stops || [];
  const driverName = trip.driver?.user?.name || trip.driver?.licenseNo || '—';

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.primaryDark, '#1A0A3E']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trip Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.headerRoute}>
          <Text style={styles.routeNo}>{trip.route?.routeNo || '—'}</Text>
          <StatusBadge status={trip.status} />
        </View>
        <Text style={styles.routeName}>{trip.route?.name || '—'}</Text>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Trip Summary</Text>
          </View>

          <View style={styles.endpointSummary}>
            <View style={styles.endpointBlock}>
              <View style={[styles.endpointDot, { backgroundColor: COLORS.success }]} />
              <Text style={styles.endpointLabel}>FROM</Text>
              <Text style={styles.endpointText}>{trip.route?.startLocation || '—'}</Text>
            </View>
            <View style={styles.connectorCol}>
              <View style={styles.connectorLine} />
              <Text style={styles.connectorIcon}>🚏</Text>
              <View style={styles.connectorLine} />
            </View>
            <View style={styles.endpointBlock}>
              <View style={[styles.endpointDot, { backgroundColor: COLORS.danger }]} />
              <Text style={styles.endpointLabel}>TO</Text>
              <Text style={styles.endpointText}>{trip.route?.endLocation || '—'}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📏</Text>
              <Text style={styles.metaValue}>{trip.route?.distance || '—'}</Text>
              <Text style={styles.metaLabel}>km</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>⏱️</Text>
              <Text style={styles.metaValue}>{trip.route?.duration || '—'}</Text>
              <Text style={styles.metaLabel}>min</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>🚏</Text>
              <Text style={styles.metaValue}>{stops.length}</Text>
              <Text style={styles.metaLabel}>stops</Text>
            </View>
          </View>
        </View>

        <View style={styles.realtimeCard}>
          <Text style={styles.realtimeTitle}>Trip Info</Text>
          <View style={styles.realtimeRow}>
            <View style={styles.realtimeItem}>
              <Text style={styles.realtimeIcon}>🕐</Text>
              <View>
                <Text style={styles.realtimeLabel}>Started</Text>
                <Text style={styles.realtimeValue}>
                  {trip.actualStart ? new Date(trip.actualStart).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                </Text>
              </View>
            </View>
            <View style={styles.realtimeItem}>
              <Text style={styles.realtimeIcon}>🚌</Text>
              <View>
                <Text style={styles.realtimeLabel}>Bus</Text>
                <Text style={styles.realtimeValue}>{trip.bus?.regNo || '—'}</Text>
              </View>
            </View>
            <View style={styles.realtimeItem}>
              <Text style={styles.realtimeIcon}>👤</Text>
              <View>
                <Text style={styles.realtimeLabel}>Driver</Text>
                <Text style={styles.realtimeValue} numberOfLines={1}>{driverName}</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Route Stops</Text>
        {stops.length === 0 ? (
          <View style={styles.noStopsBox}>
            <Text style={styles.noStopsIcon}>🚏</Text>
            <Text style={styles.noStops}>No stop information available.</Text>
          </View>
        ) : (
          <View style={styles.timelineCard}>
            {stops.map((stop, i) => (
              <StopItem key={stop.id} stop={stop} isLast={i === stops.length - 1} />
            ))}
          </View>
        )}

        <View style={{ height: SPACING['2xl'] }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  notFound: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.md },
  goBack: { marginTop: SPACING.md },
  goBackText: { color: COLORS.primaryLight, fontWeight: TYPOGRAPHY.weights.semibold },

  header: {
    paddingTop: 56, paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg, gap: SPACING.xs,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { padding: SPACING.xs },
  backArrow: { fontSize: 24, color: COLORS.textPrimary },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.textPrimary },
  headerRoute: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.sm },
  routeNo: {
    fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.textPrimary,
  },
  routeName: { fontSize: TYPOGRAPHY.sizes.sm, color: 'rgba(255,255,255,0.7)' },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    paddingHorizontal: SPACING.sm + 4, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold, letterSpacing: 1 },

  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, gap: SPACING.lg },

  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border,
    gap: SPACING.lg, ...SHADOWS.card,
  },
  summaryHeader: {},
  summaryTitle: {
    fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 2,
  },
  endpointSummary: { flexDirection: 'row', alignItems: 'stretch' },
  endpointBlock: { flex: 1, gap: SPACING.xs },
  endpointDot: { width: 10, height: 10, borderRadius: 5 },
  endpointLabel: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textMuted, fontWeight: TYPOGRAPHY.weights.bold, letterSpacing: 1 },
  endpointText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.textPrimary, fontWeight: TYPOGRAPHY.weights.medium },
  connectorCol: { alignItems: 'center', width: 48 },
  connectorLine: { flex: 1, width: 1, backgroundColor: COLORS.border },
  connectorIcon: { fontSize: 12, marginVertical: 4 },

  metaRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
  },
  metaItem: { flex: 1, alignItems: 'center', gap: 1 },
  metaIcon: { fontSize: 14 },
  metaValue: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.textPrimary, fontVariant: ['tabular-nums'] },
  metaLabel: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textMuted, textTransform: 'uppercase' },
  metaDivider: { width: 1, height: 32, backgroundColor: COLORS.border },

  realtimeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border,
    gap: SPACING.md, ...SHADOWS.card,
  },
  realtimeTitle: {
    fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 2,
  },
  realtimeRow: { flexDirection: 'row', justifyContent: 'space-between', gap: SPACING.sm },
  realtimeItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  realtimeIcon: { fontSize: 18 },
  realtimeLabel: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textMuted, textTransform: 'uppercase' },
  realtimeValue: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.textPrimary, fontWeight: TYPOGRAPHY.weights.semibold, marginTop: 2 },

  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 2,
  },

  timelineCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  stopRow: { flexDirection: 'row', gap: SPACING.md },
  stopRail: { alignItems: 'center', width: 20 },
  stopDot: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: COLORS.primary + '33',
    borderWidth: 2, borderColor: COLORS.primary,
    marginTop: 4,
  },
  stopDotLast: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  stopLine: { width: 2, flex: 1, backgroundColor: COLORS.border, marginTop: 2 },
  stopContent: { flex: 1, paddingBottom: SPACING.lg },
  stopHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stopName: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.textPrimary },
  stopSeq: {
    fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.primaryLight,
    backgroundColor: COLORS.primary + '22', paddingHorizontal: SPACING.sm,
    paddingVertical: 2, borderRadius: RADIUS.full,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  stopLandmark: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textMuted, marginTop: 2 },

  noStopsBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center', gap: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  noStopsIcon: { fontSize: 32 },
  noStops: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm, textAlign: 'center' },
});