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
  { id: 'a', icon: '✈️', label: 'Airport', color: COLORS.primary },
  { id: 'b', icon: '🏫', label: 'University', color: COLORS.accent },
  { id: 'c', icon: '🏥', label: 'Hospital', color: COLORS.success },
  { id: 'd', icon: '🛒', label: 'Mall', color: COLORS.info },
];

const FEATURED_ROUTES = [
  { id: '1', routeNo: 'R-001', name: 'City Centre Loop',        startLocation: 'Central Station', endLocation: 'Old City Gate', stops: 12, duration: 40 },
  { id: '2', routeNo: 'R-042', name: 'Airport Express',          startLocation: 'City Bus Stand',   endLocation: 'Airport T1',    stops:  6, duration: 45 },
  { id: '3', routeNo: 'R-115', name: 'North-South Corridor',     startLocation: 'North Terminal',   endLocation: 'South Depot',   stops: 18, duration: 65 },
];

const ActiveTripCard = ({ trip, onPress }) => (
  <TouchableOpacity style={styles.activeCard} onPress={onPress} activeOpacity={0.85}>
    <LinearGradient
      colors={['#0F2B1F', '#0C1914']}
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
      <Text style={styles.activeRouteName} numberOfLines={1}>{trip.route?.name || '—'}</Text>
      <View style={styles.activeEndpointRow}>
        <View style={[styles.miniDot, { backgroundColor: COLORS.success }]} />
        <Text style={styles.activeEpText} numberOfLines={1}>{trip.route?.startLocation || '—'}</Text>
      </View>
      <View style={styles.activeRouteLine}>
        <View style={styles.activeRouteLineFill} />
      </View>
      <View style={styles.activeEndpointRow}>
        <View style={[styles.miniDot, { backgroundColor: COLORS.danger }]} />
        <Text style={styles.activeEpText} numberOfLines={1}>{trip.route?.endLocation || '—'}</Text>
      </View>
      <View style={styles.activeMetaRow}>
        <Text style={styles.activeMeta}>🚌 {trip.bus?.regNo || '—'}</Text>
        <Text style={styles.activeMeta}>📍 {trip.route?.stops?.length || 0} stops</Text>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const RouteCard = ({ route, onPress }) => (
  <TouchableOpacity style={styles.routeCard} onPress={onPress} activeOpacity={0.85}>
    <View style={styles.routeNoBox}>
      <Text style={styles.routeNoText}>{route.routeNo}</Text>
    </View>
    <View style={styles.routeBody}>
      <Text style={styles.routeName} numberOfLines={1}>{route.name}</Text>
      <View style={styles.routeEndpoints}>
        <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
        <Text style={styles.epText} numberOfLines={1}>{route.startLocation}</Text>
        <Text style={styles.epArrow}>→</Text>
        <View style={[styles.dot, { backgroundColor: COLORS.danger }]} />
        <Text style={styles.epText} numberOfLines={1}>{route.endLocation}</Text>
      </View>
      <View style={styles.routeMetaRow}>
        <Text style={styles.routeMeta}>⏱️ {route.duration} min</Text>
        <Text style={styles.routeMeta}>🚏 {route.stops} stops</Text>
      </View>
    </View>
    <Text style={styles.routeChevron}>›</Text>
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
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Live Now</Text>
              <View style={styles.liveCountBadge}>
                <Text style={styles.liveCountText}>{activeTrips.length} active</Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activeTripsRow}
            >
              {activeTrips.map((t) => (
                <ActiveTripCard
                  key={t.id}
                  trip={t}
                  onPress={() => navigation.navigate('TripTracker', { tripId: t.id })}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Destinations</Text>
          <View style={styles.quickGrid}>
            {QUICK_DEST.map((d) => (
              <TouchableOpacity
                key={d.id}
                style={styles.quickItem}
                onPress={() => navigation.navigate('RouteSearch', { query: d.label })}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[d.color + '22', d.color + '0A']}
                  style={[styles.quickIcon, { borderColor: d.color + '40' }]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.quickEmoji}>{d.icon}</Text>
                </LinearGradient>
                <Text style={styles.quickLabel}>{d.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Routes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('RouteSearch')}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>
          {FEATURED_ROUTES.map((r) => (
            <RouteCard key={r.id} route={r} onPress={() => navigation.navigate('RouteSearch', { query: r.routeNo })} />
          ))}
        </View>

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
  scrollContent:{ padding: SPACING.lg, paddingTop: SPACING.lg },

  section:        { marginBottom: SPACING.xl },
  sectionHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 2,
  },
  seeAll: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.primaryLight, fontWeight: TYPOGRAPHY.weights.semibold },

  liveCountBadge: {
    backgroundColor: COLORS.success + '22',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  liveCountText: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.success, fontWeight: TYPOGRAPHY.weights.bold },

  // Active trips — horizontal scroll cards
  activeTripsRow: { gap: SPACING.md, paddingRight: SPACING.xl },
  activeCard: { width: 240, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOWS.card },
  activeCardGrad: { padding: SPACING.md, gap: SPACING.xs, borderWidth: 1, borderColor: COLORS.success + '3D', borderRadius: RADIUS.lg },
  activeCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.success + '30', paddingHorizontal: SPACING.sm,
    paddingVertical: 2, borderRadius: RADIUS.full,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success },
  liveText: { fontSize: 9, fontWeight: TYPOGRAPHY.weights.black, color: COLORS.success, letterSpacing: 1 },
  activeRouteNo: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.black, color: COLORS.primaryLight },
  activeRouteName: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.textPrimary },
  activeEndpointRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  miniDot: { width: 6, height: 6, borderRadius: 3, flexShrink: 0 },
  activeEpText: { flex: 1, fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textSecondary },
  activeRouteLine: { height: 10, justifyContent: 'center', marginLeft: 3 },
  activeRouteLineFill: { width: 1, height: '100%', backgroundColor: COLORS.border },
  activeMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.surface + '66' },
  activeMeta: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textMuted },

  // Quick destinations
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  quickItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, width: '48%', flexGrow: 1 },
  quickIcon: {
    width: 52, height: 52, borderRadius: RADIUS.md,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, ...SHADOWS.card,
  },
  quickEmoji: { fontSize: 24 },
  quickLabel: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.textSecondary, fontWeight: TYPOGRAPHY.weights.medium },

  // Popular routes
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border,
    padding: SPACING.md,
    gap: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.card,
  },
  routeNoBox: {
    width: 56, height: 56, borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary + '22',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.primary + '40',
  },
  routeNoText: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.black, color: COLORS.primaryLight },
  routeBody: { flex: 1, gap: SPACING.xs },
  routeName: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.textPrimary },
  routeEndpoints: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  dot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  epText: { flex: 1, fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textSecondary },
  epArrow: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  routeMetaRow: { flexDirection: 'row', gap: SPACING.md },
  routeMeta: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textMuted },
  routeChevron: { fontSize: 24, color: COLORS.textMuted },
});

export default HomeScreen;