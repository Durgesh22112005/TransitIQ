// =============================================================
// src/components/RouteResultCard.jsx – Passenger App
// Search result card for a transit route
// =============================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const STATUS_COLORS = {
  ACTIVE:       COLORS.success,
  INACTIVE:     COLORS.textMuted,
  UNDER_REVIEW: COLORS.warning,
};

/**
 * RouteResultCard
 * @param {object}   route   - Route object from API
 * @param {Function} onPress - tap callback
 */
const RouteResultCard = ({ route, onPress }) => {
  const statusColor = STATUS_COLORS[route.status] || COLORS.primary;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.accentBar, { backgroundColor: statusColor }]} />

      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={styles.routeNoBadge}>
            <Text style={styles.routeNo}>{route.routeNo}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: statusColor + '1A' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.status, { color: statusColor }]}>{route.status}</Text>
          </View>
        </View>

        <Text style={styles.routeName} numberOfLines={1}>{route.name}</Text>

        <View style={styles.endpointsRow}>
          <View style={styles.endpoint}>
            <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
            <Text style={styles.endpointText} numberOfLines={1}>{route.startLocation}</Text>
          </View>
          <Text style={styles.arrow}>⟶</Text>
          <View style={styles.endpoint}>
            <View style={[styles.dot, { backgroundColor: COLORS.danger }]} />
            <Text style={styles.endpointText} numberOfLines={1}>{route.endLocation}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          {route.distance  && <Text style={styles.meta}>📍 {route.distance} km</Text>}
          {route.duration  && <Text style={styles.meta}>⏱️ {route.duration} min</Text>}
          {route._count?.stops !== undefined && <Text style={styles.meta}>🚏 {route._count.stops} stops</Text>}
        </View>
      </View>

      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    alignItems: 'center',
    ...SHADOWS.card,
  },
  accentBar: { width: 4, alignSelf: 'stretch' },
  body:       { flex: 1, padding: SPACING.md, gap: SPACING.sm },
  topRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  routeNoBadge: {
    backgroundColor: COLORS.primary + '22',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  routeNo:    { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.black, color: COLORS.primaryLight },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  statusDot:  { width: 6, height: 6, borderRadius: 3 },
  status:     { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold, textTransform: 'uppercase' },
  routeName:  { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.textPrimary },
  endpointsRow:{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  endpoint:   { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  dot:        { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  endpointText:{ flex: 1, fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textSecondary },
  arrow:      { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
  metaRow:    { flexDirection: 'row', gap: SPACING.md, flexWrap: 'wrap' },
  meta:       { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textMuted },
  chevron:    { fontSize: 24, color: COLORS.textMuted, paddingRight: SPACING.md },
});

export default RouteResultCard;