import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { tripAPI } from '../services/api.service';
import useMultiBusTracking from '../hooks/useMultiBusTracking';

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

const RouteMapWeb = ({ busLocation, passengerLocation, routeCoords, distanceKm, etaMin }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const destroyedRef = useRef(false);
  const busMarkerRef = useRef(null);
  const passengerMarkerRef = useRef(null);
  const routeLineRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    destroyedRef.current = false;

    let L;
    L = require('leaflet');
    require('leaflet/dist/leaflet.css');

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      subdomains: ['a', 'b', 'c'],
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    const style = document.createElement('style');
    style.textContent = `
      .leaflet-tile-pane { filter: invert(1) hue-rotate(180deg) brightness(0.9) contrast(0.85) saturate(0.35); }
      .route-line-animated { animation: routeDash 1s linear infinite; }
      @keyframes routeDash { to { stroke-dashoffset: -16; } }
    `;
    document.head.appendChild(style);

    map.setView([20.5937, 78.9629], 14);
    mapRef.current = map;

    const timers = [
      setTimeout(() => { if (!destroyedRef.current) map.invalidateSize(); }, 100),
      setTimeout(() => { if (!destroyedRef.current) map.invalidateSize(); }, 500),
    ];

    return () => {
      destroyedRef.current = true;
      timers.forEach(clearTimeout);
      try { busMarkerRef.current?.remove(); } catch (e) {}
      try { passengerMarkerRef.current?.remove(); } catch (e) {}
      try { routeLineRef.current?.remove(); } catch (e) {}
      try { map.remove(); } catch (e) {}
      mapRef.current = null;
      busMarkerRef.current = null;
      passengerMarkerRef.current = null;
      routeLineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (destroyedRef.current || !mapRef.current) return;
    const map = mapRef.current;
    let L = require('leaflet');

    if (busMarkerRef.current) {
      try { busMarkerRef.current.remove(); } catch (e) {}
      busMarkerRef.current = null;
    }
    if (busLocation) {
      const icon = L.divIcon({
        className: 'bus-marker-icon',
        html: `<div style="position:relative;display:inline-block;">
          <div style="width:42px;height:42px;border-radius:50%;background:${COLORS.primary};border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 18px ${COLORS.primary}aa;font-size:22px;">🚌</div>
          <div style="position:absolute;bottom:-16px;left:50%;transform:translateX(-50%);background:${COLORS.primary};color:#fff;font-size:9px;font-weight:700;padding:1px 6px;border-radius:6px;white-space:nowrap;">BUS</div>
        </div>`,
        iconSize: [42, 42], iconAnchor: [21, 21],
      });
      busMarkerRef.current = L.marker([busLocation.latitude, busLocation.longitude], { icon, zIndexOffset: 1000, riseOnHover: true }).addTo(map);
      busMarkerRef.current.setZIndexOffset(1000);
    }
  }, [busLocation]);

  useEffect(() => {
    if (destroyedRef.current || !mapRef.current) return;
    const map = mapRef.current;
    let L = require('leaflet');

    if (passengerMarkerRef.current) {
      try { passengerMarkerRef.current.remove(); } catch (e) {}
      passengerMarkerRef.current = null;
    }
    if (passengerLocation) {
      const icon = L.divIcon({
        className: 'passenger-marker-icon',
        html: `<div style="position:relative;display:inline-block;">
          <div style="width:36px;height:36px;border-radius:50%;background:${COLORS.accent};border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 14px ${COLORS.accent}aa;">📍</div>
          <div style="position:absolute;bottom:-16px;left:50%;transform:translateX(-50%);background:${COLORS.accent};color:#fff;font-size:9px;font-weight:700;padding:1px 6px;border-radius:6px;white-space:nowrap;">YOU</div>
        </div>`,
        iconSize: [36, 36], iconAnchor: [18, 18],
      });
      passengerMarkerRef.current = L.marker(
        [passengerLocation.latitude, passengerLocation.longitude],
        { icon, zIndexOffset: 998, riseOnHover: true }
      ).addTo(map);
      passengerMarkerRef.current.setZIndexOffset(998);
    }
  }, [passengerLocation]);

  useEffect(() => {
    if (destroyedRef.current || !mapRef.current) return;
    const map = mapRef.current;
    let L = require('leaflet');

    if (routeLineRef.current) {
      try { routeLineRef.current.remove(); } catch (e) {}
      routeLineRef.current = null;
    }

    if (routeCoords && routeCoords.length > 1) {
      const latlngs = routeCoords.map((c) => [c[1], c[0]]);
      routeLineRef.current = L.polyline(latlngs, {
        color: '#F59E0B',
        weight: 4,
        opacity: 0.9,
        className: 'route-line-animated',
      }).addTo(map);

      const bounds = L.latLngBounds(latlngs);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    } else if (busLocation && passengerLocation) {
      const b = L.latLngBounds([
        [busLocation.latitude, busLocation.longitude],
        [passengerLocation.latitude, passengerLocation.longitude],
      ]);
      map.fitBounds(b, { padding: [60, 60], maxZoom: 16 });
    } else if (busLocation) {
      map.setView([busLocation.latitude, busLocation.longitude], 15);
    }
  }, [routeCoords, busLocation, passengerLocation]);

  return (
    <View style={styles.mapWrap}>
      <div
        ref={containerRef}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
      />
      <View style={styles.mapTopRow}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        {distanceKm !== null && (
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>{distanceKm < 1 ? `${(distanceKm * 1000).toFixed(0)}m` : `${distanceKm.toFixed(1)}km`} · {etaMin} min</Text>
          </View>
        )}
      </View>
      <View style={styles.mapLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.legendText}>Bus</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.accent }]} />
          <Text style={styles.legendText}>You</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B', width: 12, height: 3, borderRadius: 2 }]} />
          <Text style={styles.legendText}>Road route</Text>
        </View>
      </View>
    </View>
  );
};

export default function TripTrackerScreen({ route, navigation }) {
  const { tripId } = route?.params || {};
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myLocation, setMyLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState(null);
  const [routeDistance, setRouteDistance] = useState(null);
  const [routeDuration, setRouteDuration] = useState(null);
  const [fetchingRoute, setFetchingRoute] = useState(false);

  const { busLocations } = useMultiBusTracking(tripId ? [tripId] : []);
  const busLocation = tripId ? busLocations[tripId] || null : null;

  useEffect(() => {
    if (!tripId) { setLoading(false); return; }
    tripAPI.getById(tripId)
      .then((res) => setTrip(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tripId]);

  const requestMyLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMyLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      },
      () => {},
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setMyLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: false, timeout: 10000 }
      );
    }
  }, []);

  useEffect(() => {
    if (!myLocation || !busLocation) { setRouteCoords(null); return; }
    setFetchingRoute(true);
    const url = `https://router.project-osrm.org/route/v1/driving/${busLocation.longitude},${busLocation.latitude};${myLocation.longitude},${myLocation.latitude}?overview=full&geometries=geojson`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.routes && data.routes.length > 0) {
          const r = data.routes[0];
          setRouteCoords(r.geometry.coordinates);
          setRouteDistance(r.distance / 1000);
          setRouteDuration(Math.ceil(r.duration / 60));
        } else {
          setRouteCoords(null);
          setRouteDistance(null);
          setRouteDuration(null);
        }
      })
      .catch(() => {
        setRouteCoords(null);
        setRouteDistance(null);
        setRouteDuration(null);
      })
      .finally(() => setFetchingRoute(false));
  }, [myLocation, busLocation]);

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
  const isLive = trip.status === 'IN_PROGRESS';

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
        {isLive && (
          <View style={styles.mapSection}>
            <Text style={styles.sectionTitle}>Bus → You</Text>
            {fetchingRoute && (
              <View style={styles.fetchingRow}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.fetchingText}>Calculating road route...</Text>
              </View>
            )}
            <RouteMapWeb
              busLocation={busLocation}
              passengerLocation={myLocation}
              routeCoords={routeCoords}
              distanceKm={routeDistance}
              etaMin={routeDuration}
            />
            {!myLocation && (
              <TouchableOpacity style={styles.locateBtn} onPress={requestMyLocation} activeOpacity={0.8}>
                <Text style={styles.locateBtnText}>📍 Show my location for route</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

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

  mapSection: { gap: SPACING.sm },
  mapWrap: {
    height: 280, borderRadius: RADIUS.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.surface, position: 'relative',
  },
  mapTopRow: {
    position: 'absolute', top: SPACING.sm, left: SPACING.sm, right: SPACING.sm,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000,
  },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.surface + 'EE',
    borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 3,
    borderWidth: 1, borderColor: COLORS.success + '44',
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success },
  liveText: { fontSize: 9, fontWeight: TYPOGRAPHY.weights.black, color: COLORS.success, letterSpacing: 1 },
  distanceBadge: {
    backgroundColor: '#F59E0B' + 'DD',
    borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm + 2, paddingVertical: 3,
  },
  distanceText: { fontSize: 10, fontWeight: TYPOGRAPHY.weights.bold, color: '#fff' },
  mapLegend: {
    position: 'absolute', bottom: SPACING.sm, left: SPACING.sm,
    flexDirection: 'row', gap: SPACING.sm,
    backgroundColor: COLORS.surface + 'EE',
    borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 3, zIndex: 1000,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 9, color: COLORS.textSecondary, fontWeight: TYPOGRAPHY.weights.semibold },
  fetchingRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  fetchingText: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textMuted },
  locateBtn: {
    backgroundColor: COLORS.accent + '22',
    borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.accent + '44',
    paddingVertical: SPACING.sm + 2, alignItems: 'center',
  },
  locateBtnText: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.accent },

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
