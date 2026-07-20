import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { tripAPI } from '../services/api.service';
import SearchBar from '../components/SearchBar';

const QUICK_DEST = [
  { id: 'a', icon: '✈️', label: 'Airport' },
  { id: 'b', icon: '🏫', label: 'University' },
  { id: 'c', icon: '🏥', label: 'Hospital' },
  { id: 'd', icon: '🛒', label: 'Mall' },
];

const FEATURED_ROUTES = [
  { id: '1', routeNo: 'R-001', name: 'City Centre Loop',        startLocation: 'Central Station', endLocation: 'Old City Gate', stops: 12, duration: 40 },
  { id: '2', routeNo: 'R-042', name: 'Airport Express',          startLocation: 'City Bus Stand',   endLocation: 'Airport T1',    stops:  6, duration: 45 },
  { id: '3', routeNo: 'R-115', name: 'North-South Corridor',     startLocation: 'North Terminal',   endLocation: 'South Depot',   stops: 18, duration: 65 },
];

const ActiveTripCard = ({ trip, onPress }) => (
  <TouchableOpacity style={styles.activeCard} onPress={onPress} activeOpacity={0.85}>
    <LinearGradient
      colors={[COLORS.success + '25', COLORS.success + '08']}
      style={styles.activeCardGrad}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
    >
      <View style={styles.activeCardTop}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <Text style={styles.activeRouteNo}>{trip.route?.routeNo || '—'}</Text>
      </View>
      <Text style={styles.activeRouteName}>{trip.route?.name || '—'}</Text>
      <View style={styles.activeEndpoints}>
        <View style={[styles.activeDot, { backgroundColor: COLORS.success }]} />
        <Text style={styles.activeEpText} numberOfLines={1}>{trip.route?.startLocation || '—'}</Text>
        <Text style={styles.activeArrow}>→</Text>
        <View style={[styles.activeDot, { backgroundColor: COLORS.danger }]} />
        <Text style={styles.activeEpText} numberOfLines={1}>{trip.route?.endLocation || '—'}</Text>
      </View>
      <Text style={styles.activeDriver}>Driver: {trip.driver?.licenseNo || '—'} · {trip.bus?.regNo || '—'}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const RouteCard = ({ route, onPress }) => (
  <TouchableOpacity style={styles.routeCard} onPress={onPress} activeOpacity={0.85}>
    <LinearGradient
      colors={[COLORS.primary + '22', COLORS.primary + '08']}
      style={styles.routeCardGrad}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
    >
      <View style={styles.routeCardHeader}>
        <View style={styles.routeNoBox}>
          <Text style={styles.routeNo}>{route.routeNo}</Text>
        </View>
        <Text style={styles.routeDuration}>{route.duration} min</Text>
      </View>
      <Text style={styles.routeName} numberOfLines={1}>{route.name}</Text>
      <View style={styles.routeEndpoints}>
        <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
        <Text style={styles.epText} numberOfLines={1}>{route.startLocation}</Text>
        <Text style={styles.epArrow}>→</Text>
        <View style={[styles.dot, { backgroundColor: COLORS.danger }]} />
        <Text style={styles.epText} numberOfLines={1}>{route.endLocation}</Text>
      </View>
      <Text style={styles.routeStops}>{route.stops} stops</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState('');
  const [activeTrips, setActiveTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);

  useEffect(() => {
    tripAPI.getActive()
      .then((res) => setActiveTrips(res.data?.trips || []))
      .catch(() => setActiveTrips([]))
      .finally(() => setLoadingTrips(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primaryDark, '#1A0A3E', COLORS.background]}
        style={styles.hero}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <View style={styles.heroContent}>
          <View style={styles.heroLeft}>
            <Text style={styles.greeting}>{greeting} 👋</Text>
            <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'Traveller'}</Text>
          </View>
          <TouchableOpacity style={styles.avatar} onPress={logout}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'P'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('RouteSearch')} activeOpacity={0.9}>
          <SearchBar value={search} onChangeText={setSearch} placeholder="Where do you want to go?" editable={false} pointerEvents="none" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false}>
        {loadingTrips ? (
          <View style={styles.loadingActive}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : activeTrips.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Trips</Text>
              <Text style={styles.activeCount}>{activeTrips.length} trip{activeTrips.length > 1 ? 's' : ''}</Text>
            </View>
            {activeTrips.map((t) => (
              <ActiveTripCard
                key={t.id}
                trip={t}
                onPress={() => navigation.navigate('TripTracker', { tripId: t.id })}
              />
            ))}
          </>
        ) : null}

        <Text style={styles.sectionTitle}>Quick Destinations</Text>
        <View style={styles.quickRow}>
          {QUICK_DEST.map((d) => (
            <TouchableOpacity key={d.id} style={styles.quickItem} onPress={() => navigation.navigate('RouteSearch', { query: d.label })} activeOpacity={0.8}>
              <View style={styles.quickIcon}>
                <Text style={styles.quickEmoji}>{d.icon}</Text>
              </View>
              <Text style={styles.quickLabel}>{d.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.featuredHeader}>
          <Text style={styles.sectionTitle}>Popular Routes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('RouteSearch')}>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>

        {FEATURED_ROUTES.map((r) => (
          <RouteCard key={r.id} route={r} onPress={() => navigation.navigate('RouteSearch', { query: r.routeNo })} />
        ))}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingActive: { paddingVertical: SPACING.lg, alignItems: 'center' },

  hero: {
    paddingTop: 56, paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl, gap: SPACING.md,
  },
  heroContent:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLeft:     {},
  greeting:     { fontSize: TYPOGRAPHY.sizes.sm, color: 'rgba(255,255,255,0.7)' },
  userName:     { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.textPrimary },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.primary + '55',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: COLORS.primaryLight + '66',
  },
  avatarText: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.textPrimary },

  scroll:       { flex: 1 },
  scrollContent:{ padding: SPACING.lg, paddingTop: SPACING.md },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 1.5,
    marginBottom: SPACING.sm,
  },
  activeCount: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.success, fontWeight: TYPOGRAPHY.weights.bold },

  activeCard: { marginBottom: SPACING.md, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOWS.card },
  activeCardGrad: { padding: SPACING.md, gap: SPACING.xs, borderWidth: 1, borderColor: COLORS.success + '40', borderRadius: RADIUS.lg },
  activeCardTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.success + '30', paddingHorizontal: SPACING.sm,
    paddingVertical: 2, borderRadius: RADIUS.full,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success },
  liveText: { fontSize: 9, fontWeight: TYPOGRAPHY.weights.black, color: COLORS.success, letterSpacing: 1 },
  activeRouteNo: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.black, color: COLORS.primaryLight },
  activeRouteName: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.textPrimary },
  activeEndpoints: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  activeDot: { width: 6, height: 6, borderRadius: 3, flexShrink: 0 },
  activeEpText: { flex: 1, fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textSecondary },
  activeArrow: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  activeDriver: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textMuted, marginTop: 2 },

  quickRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.lg },
  quickItem:{ alignItems: 'center', gap: SPACING.xs },
  quickIcon: {
    width: 60, height: 60, borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  quickEmoji: { fontSize: 28 },
  quickLabel: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textSecondary, fontWeight: TYPOGRAPHY.weights.medium },

  featuredHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  seeAll: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.primaryLight, fontWeight: TYPOGRAPHY.weights.semibold },

  routeCard: { marginBottom: SPACING.md, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOWS.card },
  routeCardGrad: { padding: SPACING.md, gap: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg },
  routeCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  routeNoBox: { backgroundColor: COLORS.primary + '33', paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.sm },
  routeNo: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.black, color: COLORS.primaryLight },
  routeDuration: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textMuted },
  routeName: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.textPrimary },
  routeEndpoints:{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  dot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  epText: { flex: 1, fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textSecondary },
  epArrow: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  routeStops: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textMuted },
});

export default HomeScreen;
