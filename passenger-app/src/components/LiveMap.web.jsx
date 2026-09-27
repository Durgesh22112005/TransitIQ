import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const BUS_COLORS = ['#7C3AED', '#2563EB', '#EC4899', '#F59E0B', '#10B981', '#EF4444'];

const LiveMap = ({ busLocation, busLocations, route, height = 200, style }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const busMarkerRef = useRef(null);
  const multiMarkersRef = useRef({});
  const passengerMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const destroyedRef = useRef(false);
  const [myLocation, setMyLocation] = useState(null);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const makeBusIcon = (color, label) => L.divIcon({
    className: '',
    html: `<div style="position:relative;display:inline-block;">
      <div style="width:42px;height:42px;border-radius:50%;background:${color};border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 18px ${color}aa;font-size:22px;">🚌</div>
      <div style="position:absolute;bottom:-16px;left:50%;transform:translateX(-50%);background:${color};color:#fff;font-size:9px;font-weight:700;padding:1px 6px;border-radius:6px;white-space:nowrap;">${label}</div>
    </div>`,
    iconSize: [42, 42], iconAnchor: [21, 21],
  });

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    destroyedRef.current = false;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      crossOrigin: true,
      className: 'dark-tiles',
    }).addTo(map);

    const stops = route?.stops || [];
    const coords = [];
    stops.forEach((stop, i) => {
      if (stop.latitude && stop.longitude) {
        const lat = parseFloat(stop.latitude);
        const lng = parseFloat(stop.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          coords.push([lat, lng]);
          const icon = L.divIcon({
            className: '',
            html: i === 0
              ? `<div style="width:12px;height:12px;border-radius:50%;background:${COLORS.success};border:2px solid #fff;"></div>`
              : i === stops.length - 1
              ? `<div style="width:12px;height:12px;border-radius:50%;background:${COLORS.danger};border:2px solid #fff;"></div>`
              : `<div style="width:8px;height:8px;border-radius:50%;background:${COLORS.textMuted};border:1.5px solid ${COLORS.surfaceLight};"></div>`,
            iconSize: [i === 0 || i === stops.length - 1 ? 12 : 8, i === 0 || i === stops.length - 1 ? 12 : 8],
            iconAnchor: [i === 0 || i === stops.length - 1 ? 6 : 4, i === 0 || i === stops.length - 1 ? 6 : 4],
          });
          L.marker([lat, lng], { icon }).addTo(map);
        }
      }
    });

    if (coords.length > 1) {
      L.polyline(coords, {
        color: COLORS.primaryLight, weight: 2, opacity: 0.4, dashArray: '6, 8',
      }).addTo(map);
    }

    if (coords.length > 0) {
      map.fitBounds(coords, { padding: [40, 40], maxZoom: 15 });
    } else if (busLocation) {
      map.setView([busLocation.latitude, busLocation.longitude], 15);
    } else {
      map.setView([20.5937, 78.9629], 14);
    }

    const busMarker = L.marker([0, 0], {
      icon: makeBusIcon(COLORS.primary, 'BUS'),
      zIndexOffset: 1000,
    }).addTo(map);

    busMarkerRef.current = busMarker;
    mapRef.current = map;

    const timers = [
      setTimeout(() => { if (!destroyedRef.current) map.invalidateSize(); }, 100),
      setTimeout(() => { if (!destroyedRef.current) map.invalidateSize(); }, 500),
    ];

    return () => {
      destroyedRef.current = true;
      timers.forEach(clearTimeout);
      try { busMarker.remove(); } catch (e) {}
      Object.values(multiMarkersRef.current).forEach((m) => { try { m.remove(); } catch (e) {} });
      multiMarkersRef.current = {};
      try { passengerMarkerRef.current?.remove(); } catch (e) {}
      try { routeLineRef.current?.remove(); } catch (e) {}
      try { map.remove(); } catch (e) {}
      mapRef.current = null;
      busMarkerRef.current = null;
      passengerMarkerRef.current = null;
      routeLineRef.current = null;
    };
  }, [route?.id]);

  useEffect(() => {
    if (destroyedRef.current) return;
    const marker = busMarkerRef.current;
    const map = mapRef.current;
    if (!marker || !busLocation || busLocations) return;
    try {
      marker.setLatLng([busLocation.latitude, busLocation.longitude]);
      map?.panTo([busLocation.latitude, busLocation.longitude], { animate: true });
    } catch (e) {}
  }, [busLocation, busLocations]);

  useEffect(() => {
    if (destroyedRef.current || !busLocations) return;
    const map = mapRef.current;
    if (!map) return;

    const validIds = Object.keys(busLocations).filter((id) => busLocations[id]);

    Object.keys(multiMarkersRef.current).forEach((tripId) => {
      if (!validIds.includes(tripId)) {
        try { multiMarkersRef.current[tripId].remove(); } catch (e) {}
        delete multiMarkersRef.current[tripId];
      }
    });

    const allCoords = [];

    validIds.forEach((tripId, idx) => {
      const loc = busLocations[tripId];
      const color = BUS_COLORS[idx % BUS_COLORS.length];
      const label = `B${idx + 1}`;

      if (multiMarkersRef.current[tripId]) {
        multiMarkersRef.current[tripId].setLatLng([loc.latitude, loc.longitude]);
      } else {
        const icon = makeBusIcon(color, label);
        multiMarkersRef.current[tripId] = L.marker([loc.latitude, loc.longitude], {
          icon,
          zIndexOffset: 1000,
        }).addTo(map);
      }
      allCoords.push([loc.latitude, loc.longitude]);
    });

    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [busLocations]);

  const showMyLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMyLocation({ latitude: lat, longitude: lng });

        const map = mapRef.current;
        if (!map) return;

        if (passengerMarkerRef.current) {
          const offsetLat = lat + 0.0003;
          const offsetLng = lng + 0.0003;
          passengerMarkerRef.current.setLatLng([offsetLat, offsetLng]);
        } else {
          const icon = L.divIcon({
            className: '',
            html: `<div style="position:relative;display:inline-block;">
              <div style="width:36px;height:36px;border-radius:50%;background:${COLORS.accent};border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 14px ${COLORS.accent}aa;">📍</div>
              <div style="position:absolute;bottom:-16px;left:50%;transform:translateX(-50%);background:${COLORS.accent};color:#fff;font-size:9px;font-weight:700;padding:1px 6px;border-radius:6px;white-space:nowrap;">YOU</div>
            </div>`,
            iconSize: [36, 36], iconAnchor: [18, 18],
          });
          const offsetLat = lat + 0.0003;
          const offsetLng = lng + 0.0003;
          passengerMarkerRef.current = L.marker([offsetLat, offsetLng], { icon, zIndexOffset: 998 }).addTo(map);
        }

        const singleBus = busLocation || (busLocations ? Object.values(busLocations)[0] : null);
        if (singleBus) {
          if (routeLineRef.current) {
            routeLineRef.current.remove();
          }
          const busCoords = [singleBus.latitude, singleBus.longitude];
          const passengerCoords = [lat + 0.0003, lng + 0.0003];
          routeLineRef.current = L.polyline([busCoords, passengerCoords], {
            color: '#F59E0B',
            weight: 3,
            opacity: 0.8,
            dashArray: '10, 8',
            className: 'route-line-animated',
          }).addTo(map);

          const bounds = L.latLngBounds([busCoords, passengerCoords]);
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        } else {
          map.panTo([lat, lng], { animate: true });
        }
      },
      () => {},
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, [busLocation, busLocations]);

  const singleBus = busLocation || (busLocations ? Object.values(busLocations)[0] : null);
  const distance = myLocation && singleBus
    ? getDistance(singleBus.latitude, singleBus.longitude, myLocation.latitude, myLocation.longitude)
    : null;

  const busCount = busLocations ? Object.keys(busLocations).length : (busLocation ? 1 : 0);

  return (
    <View style={[styles.container, { height }, style]}>
      <style>{`
        .dark-tiles {
          filter: invert(1) hue-rotate(180deg) brightness(0.85) contrast(0.9) saturate(0.4);
        }
        .route-line-animated {
          animation: dash 1s linear infinite;
        }
        @keyframes dash {
          to { stroke-dashoffset: -18; }
        }
      `}</style>
      <div
        ref={containerRef}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
      />

      {busCount > 0 && (
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      )}

      {route?.routeNo && (
        <View style={styles.routeBadge}>
          <Text style={styles.routeBadgeText}>{route.routeNo}</Text>
        </View>
      )}

      {busCount > 1 && (
        <View style={styles.busCountBadge}>
          <Text style={styles.busCountText}>{busCount} buses</Text>
        </View>
      )}

      {distance !== null && (
        <View style={styles.distanceBadge}>
          <Text style={styles.distanceText}>{(distance * 1000).toFixed(0)}m away</Text>
        </View>
      )}

      <TouchableOpacity style={styles.myLocationBtn} onPress={showMyLocation} activeOpacity={0.7}>
        <Text style={styles.myLocationIcon}>📍</Text>
        <Text style={styles.myLocationText}>{myLocation ? 'Update' : 'My Location'}</Text>
      </TouchableOpacity>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.legendText}>Bus</Text>
        </View>
        {myLocation && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.accent }]} />
            <Text style={styles.legendText}>You</Text>
          </View>
        )}
        {myLocation && singleBus && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B', width: 12, height: 3, borderRadius: 2 }]} />
            <Text style={styles.legendText}>Route</Text>
          </View>
        )}
      </View>

      {busCount === 0 && (
        <View style={styles.waitingOverlay}>
          <View style={styles.spinnerRing} />
          <Text style={styles.waitingText}>Waiting for buses...</Text>
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
    backgroundColor: COLORS.surface,
    position: 'relative',
  },
  liveBadge: {
    position: 'absolute', top: SPACING.sm, left: SPACING.sm,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.surface + 'EE',
    borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 3,
    borderWidth: 1, borderColor: COLORS.success + '44', zIndex: 1000,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success },
  liveText: { fontSize: 9, fontWeight: TYPOGRAPHY.weights.black, color: COLORS.success, letterSpacing: 1 },
  routeBadge: {
    position: 'absolute', top: SPACING.sm, right: SPACING.sm,
    backgroundColor: COLORS.primary + 'DD',
    borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 3, zIndex: 1000,
  },
  routeBadgeText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.textPrimary, letterSpacing: 0.5 },
  busCountBadge: {
    position: 'absolute', top: SPACING.sm, left: '50%', transform: 'translateX(-50%)',
    backgroundColor: COLORS.primary + 'DD',
    borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm + 2, paddingVertical: 3, zIndex: 1000,
  },
  busCountText: { fontSize: 10, fontWeight: TYPOGRAPHY.weights.bold, color: '#fff' },
  distanceBadge: {
    position: 'absolute', top: 34, left: '50%', transform: 'translateX(-50%)',
    backgroundColor: '#F59E0B' + 'DD',
    borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm + 2, paddingVertical: 3, zIndex: 1000,
  },
  distanceText: { fontSize: 10, fontWeight: TYPOGRAPHY.weights.bold, color: '#fff' },
  myLocationBtn: {
    position: 'absolute', bottom: SPACING.sm, right: SPACING.sm,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.accent + 'DD',
    borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm + 2, paddingVertical: 5,
    zIndex: 1000, ...SHADOWS.card,
  },
  myLocationIcon: { fontSize: 14 },
  myLocationText: { fontSize: 10, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.textPrimary },
  legendRow: {
    position: 'absolute', bottom: SPACING.sm, left: SPACING.sm,
    flexDirection: 'row', gap: SPACING.sm,
    backgroundColor: COLORS.surface + 'EE',
    borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 3, zIndex: 1000,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 9, color: COLORS.textSecondary, fontWeight: TYPOGRAPHY.weights.semibold },
  waitingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', gap: SPACING.xs,
    backgroundColor: COLORS.surface + 'DD', zIndex: 999,
  },
  spinnerRing: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 3, borderColor: COLORS.primary + '33', borderTopColor: COLORS.primary,
  },
  waitingText: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.medium, color: COLORS.textSecondary },
});

export default LiveMap;
