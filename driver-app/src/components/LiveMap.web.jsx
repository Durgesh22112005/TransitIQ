// =============================================================
// src/components/LiveMap.web.jsx – Driver App (WEB ONLY)
// Live map using Leaflet (OpenStreetMap / Carto dark tiles).
// --------------------------------------------------------------
// - Plays the same role as react-native-maps does on native
// - Dark themed tiles matching the app
// - Bus marker + GPS accuracy circle
// - Follow mode: re-centers as the location updates
// - Loading overlay until first GPS fix
// (native variant lives in LiveMap.native.jsx)
// =============================================================

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const LiveMap = ({ location, gpsActive, height = 220, style }) => {
  const containerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const accuracyRef = useRef(null);

  // Init map once, as soon as the div is mounted.
  // The div is ALWAYS rendered (even while loading) so Leaflet always
  // initializes with a real, laid-out container.
  useEffect(() => {
    if (!containerRef.current || mapInstanceRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
      renderer: L.canvas(),
    });

    const carto = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
      crossOrigin: true,
    }).addTo(map);

    // Throwaway osm text layer reset the map's internal tile state when the
    // carto provider fails (e.g. blocked network / CORS).
    carto.on('tileerror', () => {
      if (mapInstanceRef.current) {
        map.removeLayer(carto);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);
      }
    });

    const marker = L.circleMarker([0, 0], {
      radius: 11,
      color: '#FFFFFF',
      weight: 3,
      fillColor: COLORS.primary,
      fillOpacity: 0.95,
    }).addTo(map);

    const accuracy = L.circle([0, 0], {
      radius: 500,
      color: COLORS.primaryLight,
      weight: 1,
      fillColor: COLORS.primaryLight,
      fillOpacity: 0.12,
    }).addTo(map);

    markerRef.current = marker;
    accuracyRef.current = accuracy;
    mapInstanceRef.current = map;

    // Waiting for the first fix: show the whole world so the map is visible.
    map.setView([location?.latitude || 20.5937, location?.longitude || 78.9629], location ? 15 : 4);

    const reposition = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };

    requestAnimationFrame(reposition);
    const t1 = setTimeout(reposition, 150);
    const t2 = setTimeout(reposition, 1000);

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(reposition) : null;
    ro?.observe(containerRef.current);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      ro?.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
      accuracyRef.current = null;
    };
  }, []);

  // Follow mode: recentre + move marker when location updates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !location) return;

    const lat = location.latitude;
    const lng = location.longitude;

    markerRef.current?.setLatLng([lat, lng]);
    const radius = typeof location.accuracy === 'number' && location.accuracy > 0 ? location.accuracy : 25;
    accuracyRef.current?.setLatLng([lat, lng]);
    accuracyRef.current?.setRadius(radius);

    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [location]);

  return (
    <View style={[styles.container, { height }, style]}>
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
      />

      {!location && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingSpinnerRing} />
          <Text style={styles.title}>Acquiring GPS...</Text>
          <Text style={styles.sub}>Waiting for location fix</Text>
        </View>
      )}

      <View style={[styles.gpsChip, { borderColor: gpsActive ? COLORS.success + '66' : COLORS.warning + '66' }]}>
        <View style={[styles.gpsDot, { backgroundColor: gpsActive ? COLORS.success : COLORS.warning }]} />
        <Text style={[styles.gpsText, { color: gpsActive ? COLORS.success : COLORS.warning }]}>
          {gpsActive ? 'GPS ACTIVE' : 'CONNECTING'}
        </Text>
      </View>

      {location && (
        <View style={styles.coordsChip}>
          <Text style={styles.coordsText}>
            {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    backgroundColor: COLORS.background,
    position: 'relative',
    ...SHADOWS.card,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.background,
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
    zIndex: 1000,
  },
  gpsDot: { width: 7, height: 7, borderRadius: 3.5 },
  gpsText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold, letterSpacing: 0.5 },
  coordsChip: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.surface + 'EE',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    zIndex: 1000,
  },
  coordsText: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textSecondary, fontVariant: ['tabular-nums'] },
});

export default LiveMap;