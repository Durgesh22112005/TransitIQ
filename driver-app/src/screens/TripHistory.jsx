import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { tripAPI } from '../services/api.service';
import Card from '../components/Card';
import { LoadingSpinner } from '../components/LoadingOverlay';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const getStatusColor = (status) => {
  switch (status) {
    case 'COMPLETED': return COLORS.success;
    case 'CANCELLED': return COLORS.danger;
    case 'IN_PROGRESS': return COLORS.primary;
    default: return COLORS.textMuted;
  }
};

const TripHistoryItem = ({ trip }) => {
  const statusColor = getStatusColor(trip.status);
  const date = trip.createdAt ? new Date(trip.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  }) : '—';
  const startTime = trip.actualStart
    ? new Date(trip.actualStart).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '—';
  const duration = trip.actualStart && trip.actualEnd
    ? calculateDuration(trip.actualStart, trip.actualEnd)
    : '—';

  return (
    <Card padding={SPACING.md} style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <View style={styles.historyRoute}>
          <Text style={styles.historyRouteNo}>{trip.route?.routeNo || '—'}</Text>
          <Text style={styles.historyRouteName} numberOfLines={1}>{trip.route?.name || 'Unknown Route'}</Text>
        </View>
        <View style={[styles.historyStatus, { backgroundColor: statusColor + '15' }]}>
          <View style={[styles.historyStatusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.historyStatusText, { color: statusColor }]}>{trip.status}</Text>
        </View>
      </View>

      <View style={styles.historyBody}>
        <View style={styles.historyDetail}>
          <Text style={styles.historyDetailIcon}>📅</Text>
          <Text style={styles.historyDetailValue}>{date}</Text>
        </View>
        <View style={styles.historyDetail}>
          <Text style={styles.historyDetailIcon}>🕐</Text>
          <Text style={styles.historyDetailValue}>{startTime}</Text>
        </View>
        <View style={styles.historyDetail}>
          <Text style={styles.historyDetailIcon}>⏱️</Text>
          <Text style={styles.historyDetailValue}>{duration}</Text>
        </View>
      </View>

      <View style={styles.historyEndpoints}>
        <View style={styles.historyEndpoint}>
          <View style={[styles.historyDot, { backgroundColor: COLORS.success }]} />
          <Text style={styles.historyEndpointText} numberOfLines={1}>{trip.route?.startLocation || '—'}</Text>
        </View>
        <View style={styles.historyRouteLine} />
        <View style={styles.historyEndpoint}>
          <View style={[styles.historyDot, { backgroundColor: COLORS.danger }]} />
          <Text style={styles.historyEndpointText} numberOfLines={1}>{trip.route?.endLocation || '—'}</Text>
        </View>
      </View>
    </Card>
  );
};

const calculateDuration = (start, end) => {
  const diff = new Date(end) - new Date(start);
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remaining = mins % 60;
  return `${hrs}h ${remaining}m`;
};

const TripHistory = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrips = useCallback(async () => {
    try {
      setError(null);
      const response = await tripAPI.getCurrent();
      const completed = response?.data?.trip ? [response.data.trip] : [];
      setTrips(completed);
    } catch (err) {
      setError(err.message || 'Failed to load trip history.');
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchTrips();
      setLoading(false);
    };
    load();
  }, [fetchTrips]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTrips();
    setRefreshing(false);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchTrips} />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trip History</Text>
        <Text style={styles.headerSub}>{trips.length} trip{trips.length !== 1 ? 's' : ''}</Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />
        }
        showsVerticalScrollIndicator={false}
      >
        {trips.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No Trips Yet"
            message="Your completed trips will appear here."
          />
        ) : (
          trips.map((trip) => (
            <TripHistoryItem key={trip.id} trip={trip} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING['3xl'] },

  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: RADIUS['2xl'],
    borderBottomRightRadius: RADIUS['2xl'],
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textWhite,
  },
  headerSub: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },

  historyCard: { gap: SPACING.sm },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyRoute: { flex: 1, marginRight: SPACING.sm },
  historyRouteNo: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.primary,
  },
  historyRouteName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textPrimary,
    marginTop: 1,
  },
  historyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  historyStatusDot: { width: 6, height: 6, borderRadius: 3 },
  historyStatusText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold },

  historyBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  historyDetail: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  historyDetailIcon: { fontSize: 12 },
  historyDetailValue: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.textSecondary, fontWeight: TYPOGRAPHY.weights.medium },

  historyEndpoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingTop: SPACING.xs,
  },
  historyEndpoint: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  historyDot: { width: 8, height: 8, borderRadius: 4 },
  historyEndpointText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.textSecondary, flex: 1 },
  historyRouteLine: { width: 20, height: 1, borderTopWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed' },
});

export default TripHistory;
