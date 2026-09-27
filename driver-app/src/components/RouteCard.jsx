import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import StatusBadge from './StatusBadge';

const RouteCard = ({ route, onPress }) => {
  const statusColor = {
    ACTIVE:       COLORS.success,
    INACTIVE:     COLORS.textMuted,
    UNDER_REVIEW: COLORS.warning,
  }[route.status] || COLORS.primary;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <Text style={styles.routeNo}>{route.routeNo}</Text>
        <StatusBadge label={route.status} color={statusColor} />
      </View>

      <Text style={styles.routeName} numberOfLines={1}>{route.name}</Text>

      <View style={styles.endpointsRow}>
        <View style={styles.endpoint}>
          <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
          <Text style={styles.endpointText} numberOfLines={1}>{route.startLocation}</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
        <View style={styles.endpoint}>
          <View style={[styles.dot, { backgroundColor: COLORS.danger }]} />
          <Text style={styles.endpointText} numberOfLines={1}>{route.endLocation}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        {route.distance && (
          <Text style={styles.meta}>{route.distance} km</Text>
        )}
        {route.duration && (
          <Text style={styles.meta}>{route.duration} min</Text>
        )}
        {route._count?.stops !== undefined && (
          <Text style={styles.meta}>{route._count.stops} stops</Text>
        )}
      </View>
    </TouchableOpacity>
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
    gap: SPACING.sm,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  routeNo: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.black, color: COLORS.primaryLight },
  routeName: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.textPrimary },
  endpointsRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  endpoint: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  dot: { width: 7, height: 7, borderRadius: 3.5, flexShrink: 0 },
  endpointText: { flex: 1, fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.textSecondary },
  arrow: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.md },
  metaRow: { flexDirection: 'row', gap: SPACING.md, flexWrap: 'wrap' },
  meta: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textMuted },
});

export default RouteCard;
