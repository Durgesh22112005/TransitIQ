import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Alert, StatusBar, Animated, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, GLASS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, ANIMATION } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api.service';
import Card from '../components/Card';
import GlassView from '../components/GlassView';
import GlassBackground from '../components/GlassBackground';
import TripCard from '../components/TripCard';
import { LoadingSpinner } from '../components/LoadingOverlay';
import EmptyState from '../components/EmptyState';
import tripService from '../services/TripService';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const StatCard = ({ icon, label, value, color, index }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: ANIMATION.fadeIn,
        delay: 200 + index * ANIMATION.staggerDelay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: ANIMATION.slideUp,
        delay: 200 + index * ANIMATION.staggerDelay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.statCard, { opacity, transform: [{ translateY }], borderLeftColor: color || COLORS.primary }]}>
      <Ionicons name={icon} size={18} color={color || COLORS.primary} />
      <Text style={[styles.statValue, { color: color || COLORS.primary }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={16} color={COLORS.textMuted} style={styles.infoIcon} />
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  </View>
);

const DriverDashboard = ({ navigation }) => {
  const { user: authUser, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [startingTrip, setStartingTrip] = useState(false);

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;

  const fetchProfile = useCallback(async () => {
    try {
      const response = await authAPI.getMe();
      setProfile(response?.data || null);
    } catch {
      setProfile(null);
    }
  }, []);

  const fetchTrip = useCallback(async () => {
    const data = await tripService.fetchCurrentTrip();
    setTrip(data);
    return data;
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchTrip()]);
      setLoading(false);
    };
    load();
  }, [fetchProfile, fetchTrip]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProfile();
      fetchTrip();
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
    });
    return unsubscribe;
  }, [navigation, fetchProfile, fetchTrip]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProfile(), fetchTrip()]);
    setRefreshing(false);
  };

  const handleStartTrip = () => {
    if (!trip) {
      Alert.alert('No Trip', 'No trip assigned to start.');
      return;
    }
    if (trip.status === 'IN_PROGRESS') {
      Alert.alert('Trip Already Active', 'This trip is already in progress.');
      return;
    }

    Alert.alert(
      'Start Trip',
      `Begin route ${trip.route?.routeNo || ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Now',
          onPress: async () => {
            setStartingTrip(true);
            const result = await tripService.startTrip(trip.id);
            setStartingTrip(false);

            if (result.success) {
              navigation.navigate('MainTabs', {
                screen: 'LiveTracking',
                params: {
                  tripId: trip.id,
                  driverId: trip.driverId,
                  routeId: trip.routeId,
                  trip: result.trip,
                },
              });
            } else {
              Alert.alert('Error', result.error || 'Failed to start trip.');
            }
          },
        },
      ]
    );
  };

  const handleEndTrip = async () => {
    if (!trip || trip.status !== 'IN_PROGRESS') return;

    Alert.alert(
      'End Trip',
      'Are you sure you want to end this trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Trip',
          style: 'destructive',
          onPress: async () => {
            const result = await tripService.endTrip(trip.id);
            if (result.success) {
              setTrip(null);
              Alert.alert('Trip Ended', 'Trip has been completed successfully.');
            } else {
              Alert.alert('Error', result.error || 'Failed to end trip.');
            }
          },
        },
      ]
    );
  };

  const handleLiveTracking = () => {
    navigation.navigate('MainTabs', {
      screen: 'LiveTracking',
      params: { tripId: trip.id, driverId: trip.driverId, routeId: trip.routeId, trip },
    });
  };

  const driver = profile?.driver;
  const hasActiveTrip = trip?.status === 'IN_PROGRESS';

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <GlassBackground>
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primaryLight}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={GRADIENTS.header}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View style={[styles.headerTop, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
            <View style={styles.headerInfo}>
              <Text style={styles.headerGreeting}>{getGreeting()}</Text>
              <Text style={styles.headerName}>{authUser?.name || 'Driver'}</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
              style={styles.avatar}
              activeOpacity={0.8}
            >
              <Text style={styles.avatarText}>
                {authUser?.name?.[0]?.toUpperCase() || 'D'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.statusRow, { opacity: headerFade }]}>
            <GlassView intensity={20} tint="dark" style={[styles.statusBadge, { backgroundColor: hasActiveTrip ? 'rgba(16,185,129,0.2)' : 'rgba(148,163,184,0.15)' }]}>
              <View style={[styles.statusDot, { backgroundColor: hasActiveTrip ? COLORS.success : COLORS.textMuted }]} />
              <Text style={styles.statusText}>{hasActiveTrip ? 'On Trip' : 'Available'}</Text>
            </GlassView>
            {trip?.route && (
              <GlassView intensity={20} tint="dark" style={styles.routeBadge}>
                <Ionicons name="bus" size={12} color={COLORS.textWhite} />
                <Text style={styles.routeBadgeText}>{trip.route.routeNo}</Text>
              </GlassView>
            )}
          </Animated.View>
        </LinearGradient>

        <Card padding={SPACING.md} delay={100}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="person" size={16} color={COLORS.primaryLight} />
              <Text style={styles.cardTitle}>Driver Profile</Text>
            </View>
          </View>
          <InfoRow icon="person-outline" label="Name" value={profile?.name} />
          <InfoRow icon="mail-outline" label="Email" value={profile?.email} />
          <InfoRow icon="call-outline" label="Phone" value={profile?.phone || 'Not provided'} />
          {driver && (
            <>
              <InfoRow icon="card-outline" label="License" value={driver.licenseNo} />
              <InfoRow icon="calendar-outline" label="Experience" value={driver.experience ? `${driver.experience} years` : '—'} />
            </>
          )}
        </Card>

        <Card padding={SPACING.md} delay={180}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="bus" size={16} color={COLORS.primaryLight} />
              <Text style={styles.cardTitle}>Assigned Bus</Text>
            </View>
            {driver?.assignedBus && (
              <View style={styles.busBadge}>
                <Text style={styles.busBadgeText}>{driver.assignedBus.regNo}</Text>
              </View>
            )}
          </View>
          {driver?.assignedBus ? (
            <>
              <InfoRow icon="bus-outline" label="Registration" value={driver.assignedBus.regNo} />
              <InfoRow icon="pricetag-outline" label="Model" value={driver.assignedBus.model} />
              <InfoRow icon="people-outline" label="Capacity" value={`${driver.assignedBus.capacity} seats`} />
            </>
          ) : (
            <Text style={styles.mutedText}>No bus assigned</Text>
          )}
        </Card>

        {trip ? (
          <TripCard
            trip={trip}
            onStart={handleStartTrip}
            onEnd={handleEndTrip}
            starting={startingTrip}
          />
        ) : (
          <Card padding={SPACING.lg} delay={260}>
            <EmptyState
              icon="📋"
              title="No Trip Assigned"
              message="You don't have any active trips. Please check with your dispatcher."
            />
          </Card>
        )}

        {trip && trip.route && (
          <Card padding={SPACING.md} delay={340}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="stats-chart" size={16} color={COLORS.primaryLight} />
              <Text style={styles.cardTitle}>Quick Stats</Text>
            </View>
            <View style={styles.statsGrid}>
              <StatCard icon="bus" label="Trips Today" value="3" color={COLORS.primary} index={0} />
              <StatCard
                icon="location"
                label="Distance"
                value={trip.route?.distance ? `${trip.route.distance} km` : '—'}
                color={COLORS.success}
                index={1}
              />
              <StatCard
                icon="time"
                label="Duration"
                value={trip.route?.duration ? `${trip.route.duration} min` : '—'}
                color={COLORS.warning}
                index={2}
              />
            </View>
          </Card>
        )}

        {hasActiveTrip && (
          <TouchableOpacity style={styles.liveBtn} onPress={handleLiveTracking} activeOpacity={0.8}>
            <View style={styles.liveBtnIconWrap}>
              <Ionicons name="location" size={18} color={COLORS.primaryLight} />
            </View>
            <Text style={styles.liveBtnText}>Go to Live Tracking</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.primaryLight} />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
    </GlassBackground>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: SPACING['3xl'] },

  header: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: RADIUS['2xl'],
    borderBottomRightRadius: RADIUS['2xl'],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerInfo: { flex: 1 },
  headerGreeting: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  headerName: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textWhite,
    marginTop: 2,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textWhite,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
  },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusText: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textWhite, fontWeight: TYPOGRAPHY.weights.semibold },
  routeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  routeBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textWhite,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primaryLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm - 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoIcon: { width: 20, textAlign: 'center' },
  infoContent: { flex: 1 },
  infoLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginTop: 1,
  },

  busBadge: {
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  busBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.primaryLight,
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2,
    borderLeftWidth: 3,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs - 1,
    color: COLORS.textMuted,
  },

  liveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    padding: SPACING.md,
    gap: SPACING.sm,
    ...SHADOWS.subtle,
  },
  liveBtnIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveBtnText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primaryLight,
  },

  mutedText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.danger + '30',
    backgroundColor: COLORS.surface,
  },
  logoutText: { color: COLORS.danger, fontWeight: TYPOGRAPHY.weights.semibold, fontSize: TYPOGRAPHY.sizes.sm },
});

export default DriverDashboard;
