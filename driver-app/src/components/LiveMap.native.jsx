// =============================================================
// src/components/LiveMap.native.jsx – Driver App (NATIVE ONLY)
// Real-time bus position map (react-native-maps)
// --------------------------------------------------------------
// - Dark themed map matching the app
// - Custom bus marker
// - GPS accuracy circle
// - Follow mode: re-centers as the bus moves
// - Loading state until first GPS fix
// (web variant lives in LiveMap.web.jsx)
// =============================================================

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#12121F' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#A0A0C0' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0A0A14' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'on' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#2D2D4E' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1C1C2E' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#26263D' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#34345A' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#E5E7EB' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#2E2E4A' }] },
  { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#232338' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1C1C2E' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#101028' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#5B5B86' }] },
];

const REGION_SPAN = {
  follow:  { latitudeDelta: 0.02, longitudeDelta: 0.02 },
  overview: { latitudeDelta: 0.08, longitudeDelta: 0.08 },
};

const LiveMap = ({ location, gpsActive, height = 220, style }) => {
  const mapRef = useRef(null);

  // Keep the bus centered (follow mode)
  useEffect(() => {
    if (!location) return;
    const target = {
      latitude: location.latitude,
      longitude: location.longitude,
      ...REGION_SPAN.follow,
    };
    if (mapRef.current) {
      mapRef.current.animateToRegion(target, 500);
    }
  }, [location]);

  // Loading state – waiting for first GPS fix
  if (!location) {
    return (
      <View style={[styles.container, styles.loading, style]}>
        <View style={styles.loadingSpinnerRing} />
        <Text style={styles.title}>Acquiring GPS...</Text>
        <Text style={styles.sub}>Waiting for location fix</Text>
      </View>
    );
  }

  const { latitude, longitude, heading = 0, accuracy } = location;

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{ latitude, longitude, ...REGION_SPAN.overview }}
        customMapStyle={DARK_MAP_STYLE}
        mapType="standard"
        showsUserLocation={false}
        showsCompass={false}
        showsScale={false}
        rotateEnabled={false}
        pitchEnabled={false}
        scrollEnabled
        zoomEnabled
        toolbarEnabled={false}
        loadingEnabled
        loadingBackgroundColor={COLORS.background}
        loadingIndicatorColor={COLORS.primary}
      >
        {typeof accuracy === 'number' && accuracy > 0 && (
          <Circle
            center={{ latitude, longitude }}
            radius={accuracy}
            fillColor={COLORS.primary + '22'}
            strokeColor={COLORS.primary + '55'}
            strokeWidth={1}
          />
        )}
        <Marker
          coordinate={{ latitude, longitude }}
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={false}
        >
          <View style={styles.marker}>
            <View style={styles.markerRing}>
              <View style={styles.markerInner} />
            </View>
          </View>
        </Marker>
      </MapView>

      {/* Heading indicator */}
      <View style={styles.headingBadge}>
        <Text style={styles.headingText}>
          {heading != null && !isNaN(heading) ? `🧭 ${Math.round(heading)}°` : '🧭 —'}
        </Text>
      </View>

      {/* GPS status chip */}
      <View style={[styles.gpsChip, { borderColor: gpsActive ? COLORS.success + '66' : COLORS.warning + '66' }]}>
        <View style={[styles.gpsDot, { backgroundColor: gpsActive ? COLORS.success : COLORS.warning }]} />
        <Text style={[styles.gpsText, { color: gpsActive ? COLORS.success : COLORS.warning }]}>
          {gpsActive ? 'GPS ACTIVE' : 'CONNECTING'}
        </Text>
      </View>

      {/* Re-center control */}
      <TouchableOpacity
        style={styles.centerBtn}
        onPress={() => {
          if (mapRef.current && location) {
            mapRef.current.animateToRegion({ latitude, longitude, ...REGION_SPAN.follow }, 400);
          }
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.centerIcon}>◎</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 220,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.background,
    ...SHADOWS.card,
  },
  map: { ...StyleSheet.absoluteFillObject },

  // Bus marker
  marker: {
    width: 34, height: 34,
    borderRadius: 17,
    justifyContent: 'center', alignItems: 'center',
  },
  markerRing: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.primary + '2E',
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  markerInner: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.textWhite,
  },

  headingBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.surface + 'EE',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headingText: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textSecondary, fontWeight: TYPOGRAPHY.weights.semibold },

  gpsChip: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface + 'EE',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  gpsDot: { width: 7, height: 7, borderRadius: 3.5 },
  gpsText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold, letterSpacing: 0.5 },

  centerBtn: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.surface + 'EE',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  centerIcon: { fontSize: 18, color: COLORS.primaryLight },

  // Loading state
  loading: {
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  loadingSpinnerRing: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 3,
    borderColor: COLORS.primary + '33',
    borderTopColor: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  title: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.textSecondary },
  sub: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textMuted },
});

export default LiveMap;