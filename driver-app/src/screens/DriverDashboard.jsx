import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Alert, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api.service';
import Card from '../components/Card';
import TripCard from '../components/TripCard';
import { LoadingSpinner } from '../components/LoadingOverlay';
import EmptyState from '../components/EmptyState';
import tripService from '../services/TripService';

const StatCard = ({ icon, label, value, color }) => (
  <View style={[styles.statCard, { borderLeftColor: color || COLORS.primary }]}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={[styles.statValue, { color: color || COLORS.primary }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoIcon}>{icon}</Text>
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
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerInfo}>
              <Text style={styles.headerGreeting}>Good Morning</Text>
              <Text style={styles.headerName}>{authUser?.name || 'Driver'}</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {authUser?.name?.[0]?.toUpperCase() || 'D'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statusRow}>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: hasActiveTrip ? COLORS.success : COLORS.textMuted }]} />
              <Text style={styles.statusText}>{hasActiveTrip ? 'On Trip' : 'Available'}</Text>
            </View>
            {trip?.route && (
              <Text style={styles.routeBadge}>{trip.route.routeNo}</Text>
            )}
          </View>
        </LinearGradient>

        <Card padding={SPACING.md}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Driver Profile</Text>
          </View>
          <InfoRow icon="👤" label="Name" value={profile?.name} />
          <InfoRow icon="📧" label="Email" value={profile?.email} />
          <InfoRow icon="📱" label="Phone" value={profile?.phone || 'Not provided'} />
          {driver && (
            <>
              <InfoRow icon="🪪" label="License" value={driver.licenseNo} />
              <InfoRow icon="📅" label="Experience" value={driver.experience ? `${driver.experience} years` : '—'} />
            </>
          )}
        </Card>

        <Card padding={SPACING.md}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Assigned Bus</Text>
            {driver?.assignedBus && (
              <View style={styles.busBadge}>
                <Text style={styles.busBadgeText}>{driver.assignedBus.regNo}</Text>
              </View>
            )}
          </View>
          {driver?.assignedBus ? (
            <>
              <InfoRow icon="🚌" label="Registration" value={driver.assignedBus.regNo} />
              <InfoRow icon="🏷️" label="Model" value={driver.assignedBus.model} />
              <InfoRow icon="👥" label="Capacity" value={`${driver.assignedBus.capacity} seats`} />
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
          <Card padding={SPACING.lg}>
            <EmptyState
              icon="📋"
              title="No Trip Assigned"
              message="You don't have any active trips. Please check with your dispatcher."
            />
          </Card>
        )}

        {trip && trip.route && (
          <Card padding={SPACING.md}>
            <Text style={styles.cardTitle}>Quick Stats</Text>
            <View style={styles.statsGrid}>
              <StatCard icon="🚌" label="Trips Today" value="3" color={COLORS.primary} />
              <StatCard
                icon="📍"
                label="Distance"
                value={trip.route?.distance ? `${trip.route.distance} km` : '—'}
                color={COLORS.success}
              />
              <StatCard
                icon="⏱️"
                label="Duration"
                value={trip.route?.duration ? `${trip.route.duration} min` : '—'}
                color={COLORS.warning}
              />
            </View>
          </Card>
        )}

        {hasActiveTrip && (
          <TouchableOpacity style={styles.liveBtn} onPress={handleLiveTracking} activeOpacity={0.8}>
            <Text style={styles.liveBtnIcon}>📍</Text>
            <Text style={styles.liveBtnText}>Go to Live Tracking</Text>
            <Text style={styles.liveBtnArrow}>→</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
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
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textWhite, fontWeight: TYPOGRAPHY.weights.semibold },
  routeBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textWhite,
    fontWeight: TYPOGRAPHY.weights.semibold,
    overflow: 'hidden',
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoIcon: { fontSize: 18, width: 28 },
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
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 3,
    alignItems: 'center',
    gap: 2,
  },
  statIcon: { fontSize: 20 },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textMuted,
  },

  liveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  liveBtnIcon: { fontSize: 18 },
  liveBtnText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
  },
  liveBtnArrow: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  mutedText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },

  logoutBtn: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.danger + '40',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  logoutText: { color: COLORS.danger, fontWeight: TYPOGRAPHY.weights.semibold, fontSize: TYPOGRAPHY.sizes.sm },
});

export default DriverDashboard;
