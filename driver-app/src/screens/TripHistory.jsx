import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, StatusBar, Animated, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, GLASS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, ANIMATION } from '../constants/theme';
import { tripAPI } from '../services/api.service';
import Card from '../components/Card';
import GlassView from '../components/GlassView';
import GlassBackground from '../components/GlassBackground';
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

const TripHistoryItem = ({ trip, index }) => {
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

  const itemOpacity = useRef(new Animated.Value(0)).current;
  const itemTranslateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(itemOpacity, {
        toValue: 1,
        duration: ANIMATION.fadeIn,
        delay: index * ANIMATION.staggerDelay,
        useNativeDriver: true,
      }),
      Animated.timing(itemTranslateY, {
        toValue: 0,
        duration: ANIMATION.slideUp,
        delay: index * ANIMATION.staggerDelay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity: itemOpacity, transform: [{ translateY: itemTranslateY }] }]}>
      <Card padding={SPACING.md} animate={false} style={styles.historyCard}>
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
            <Ionicons name="calendar-outline" size={13} color={COLORS.textMuted} />
            <Text style={styles.historyDetailValue}>{date}</Text>
          </View>
          <View style={styles.historyDetail}>
            <Ionicons name="time-outline" size={13} color={COLORS.textMuted} />
            <Text style={styles.historyDetailValue}>{startTime}</Text>
          </View>
          <View style={styles.historyDetail}>
            <Ionicons name="hourglass-outline" size={13} color={COLORS.textMuted} />
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
    </Animated.View>
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

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;

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

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: ANIMATION.fadeIn,
        useNativeDriver: true,
      }),
      Animated.timing(headerSlide, {
        toValue: 0,
        duration: ANIMATION.slideUp,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTrips();
    setRefreshing(false);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchTrips} />;

  return (
    <GlassBackground>
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <LinearGradient
        colors={GRADIENTS.header}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View style={[styles.headerContent, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="time" size={20} color={COLORS.textWhite} />
            <Text style={styles.headerTitle}>Trip History</Text>
          </View>
          <GlassView intensity={20} tint="dark" style={styles.routeBadge}>
            <Text style={styles.routeBadgeText}>{trips.length} trip{trips.length !== 1 ? 's' : ''}</Text>
          </GlassView>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primaryLight} colors={[COLORS.primary]} />
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
          trips.map((trip, index) => (
            <TripHistoryItem key={trip.id} trip={trip} index={index} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
    </GlassBackground>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING['3xl'] },

  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: RADIUS['2xl'],
    borderBottomRightRadius: RADIUS['2xl'],
  },
  headerContent: {},
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textWhite,
  },
  headerSub: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: SPACING.xs,
    marginLeft: 28,
  },
  routeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
  },
  routeBadgeText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textWhite,
    fontWeight: TYPOGRAPHY.weights.semibold,
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
    color: COLORS.primaryLight,
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
  historyDetailValue: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.textSecondary, fontWeight: TYPOGRAPHY.weights.medium },

  historyEndpoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingTop: SPACING.xs,
  },
  historyEndpoint: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  historyDot: { width: 7, height: 7, borderRadius: 3.5 },
  historyEndpointText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.textSecondary, flex: 1 },
  historyRouteLine: { width: 20, height: 1, borderTopWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed' },
});

export default TripHistory;
