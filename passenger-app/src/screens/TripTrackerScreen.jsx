import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { tripAPI } from '../services/api.service';

const StopItem = ({ stop, index, isCurrent, isLast }) => (
  <View style={styles.stopRow}>
    <View style={styles.stopLineCol}>
      <View style={[styles.stopDot, isCurrent && styles.stopDotActive]} />
      {!isLast && <View style={styles.stopLine} />}
    </View>
    <View style={[styles.stopContent, isCurrent && styles.stopContentActive]}>
      <Text style={[styles.stopName, isCurrent && styles.stopNameActive]}>
        {isCurrent ? '📍 ' : ''}{stop.name}
      </Text>
      {stop.landmark && <Text style={styles.stopLandmark}>{stop.landmark}</Text>}
      <Text style={styles.stopSeq}>Stop #{stop.sequence}</Text>
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
        <Text style={{ color: COLORS.textMuted }}>Trip not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: SPACING.md }}>
          <Text style={{ color: COLORS.primaryLight }}>Go Back</Text>
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
          <Text style={styles.headerTitle}>Trip Tracking</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.routeNo}>{trip.route?.routeNo || '—'}</Text>
        <Text style={styles.routeName}>{trip.route?.name || '—'}</Text>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false}>
        <View style={styles.statusCard}>
          <View style={[styles.statusBadge, { backgroundColor: trip.status === 'IN_PROGRESS' ? COLORS.success + '20' : COLORS.warning + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: trip.status === 'IN_PROGRESS' ? COLORS.success : COLORS.warning }]} />
            <Text style={[styles.statusText, { color: trip.status === 'IN_PROGRESS' ? COLORS.success : COLORS.warning }]}>
              {trip.status === 'IN_PROGRESS' ? 'LIVE' : trip.status}
            </Text>
          </View>
          <View style={styles.tripInfo}>
            <Text style={styles.infoLabel}>Started</Text>
            <Text style={styles.infoValue}>
              {trip.actualStart ? new Date(trip.actualStart).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
            </Text>
          </View>
          <View style={styles.tripInfo}>
            <Text style={styles.infoLabel}>Driver</Text>
            <Text style={styles.infoValue}>{driverName}</Text>
          </View>
          <View style={styles.tripInfo}>
            <Text style={styles.infoLabel}>Bus</Text>
            <Text style={styles.infoValue}>{trip.bus?.regNo || '—'}</Text>
          </View>
        </View>

        <View style={styles.endpointsCard}>
          <View style={styles.endpoint}>
            <View style={[styles.endpointDot, { backgroundColor: COLORS.success }]} />
            <Text style={styles.endpointText}>{trip.route?.startLocation || '—'}</Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.endpoint}>
            <View style={[styles.endpointDot, { backgroundColor: COLORS.danger }]} />
            <Text style={styles.endpointText}>{trip.route?.endLocation || '—'}</Text>
          </View>
          {trip.route?.distance && (
            <Text style={styles.distanceText}>{trip.route.distance} km · {trip.route.duration || '—'} min</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Route Stops</Text>
        {stops.length === 0 ? (
          <Text style={styles.noStops}>No stop information available.</Text>
        ) : (
          stops.map((stop, i) => (
            <StopItem key={stop.id} stop={stop} index={i} isCurrent={false} isLast={i === stops.length - 1} />
          ))
        )}

        <View style={{ height: SPACING['2xl'] }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },

  header: {
    paddingTop: 56, paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg, gap: SPACING.xs,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { padding: SPACING.xs },
  backArrow: { fontSize: 24, color: COLORS.textPrimary },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.textPrimary },
  routeNo: {
    fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.primaryLight, textAlign: 'center',
  },
  routeName: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.textSecondary, textAlign: 'center' },

  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, gap: SPACING.md },

  statusCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
    flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, ...SHADOWS.card,
  },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    paddingHorizontal: SPACING.sm + 4, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold, letterSpacing: 1 },
  tripInfo: { minWidth: 80 },
  infoLabel: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textMuted, textTransform: 'uppercase' },
  infoValue: { fontSize: TYPOGRAPHY.sizes.md, color: COLORS.textPrimary, fontWeight: TYPOGRAPHY.weights.semibold, marginTop: 2 },

  endpointsCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
    gap: SPACING.sm, ...SHADOWS.card,
  },
  endpoint: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  endpointDot: { width: 10, height: 10, borderRadius: 5 },
  endpointText: { fontSize: TYPOGRAPHY.sizes.md, color: COLORS.textPrimary, fontWeight: TYPOGRAPHY.weights.medium },
  routeLine: { height: 1, backgroundColor: COLORS.border, marginLeft: 4, marginRight: 4, borderStyle: 'dashed' },
  distanceText: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textMuted, textAlign: 'center' },

  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 1.5,
    marginTop: SPACING.sm,
  },
  noStops: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm, textAlign: 'center', paddingVertical: SPACING.lg },

  stopRow: { flexDirection: 'row', gap: SPACING.md },
  stopLineCol: { alignItems: 'center', width: 20 },
  stopDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.border, marginTop: 4 },
  stopDotActive: { backgroundColor: COLORS.primary, width: 16, height: 16, borderRadius: 8 },
  stopLine: { width: 2, flex: 1, backgroundColor: COLORS.border, marginTop: 4 },
  stopContent: { flex: 1, paddingBottom: SPACING.lg },
  stopContentActive: {
    backgroundColor: COLORS.primary + '15', borderRadius: RADIUS.md,
    padding: SPACING.sm, marginLeft: -SPACING.sm,
  },
  stopName: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.textPrimary },
  stopNameActive: { color: COLORS.primaryLight },
  stopLandmark: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  stopSeq: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
});
