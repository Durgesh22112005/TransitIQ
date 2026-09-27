import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const BUS_COLORS = ['#7C3AED', '#2563EB', '#EC4899', '#F59E0B', '#10B981', '#EF4444'];

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#12121F' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#A0A0C0' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0A0A14' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#26263D' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#34345A' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#101028' }] },
];

const LiveMap = ({ busLocation, busLocations, route, height = 200, style }) => {
  const mapRef = useRef(null);
  const [myLocation, setMyLocation] = useState(null);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  useEffect(() => {
    if (!busLocation || !mapRef.current) return;
    mapRef.current.animateToRegion({
      latitude: busLocation.latitude,
      longitude: busLocation.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }, 500);
  }, [busLocation]);

  const stops = route?.stops || [];
  const coords = stops
    .filter((s) => s.latitude && s.longitude)
    .map((s) => ({ latitude: parseFloat(s.latitude), longitude: parseFloat(s.longitude) }));

  const multiBusList = busLocations
    ? Object.entries(busLocations)
        .filter(([, loc]) => loc)
        .map(([tripId, loc], idx) => ({
          tripId,
          ...loc,
          color: BUS_COLORS[idx % BUS_COLORS.length],
          label: `B${idx + 1}`,
        }))
    : [];

  const singleBus = busLocation || multiBusList[0] || null;

  const initialRegion = coords.length > 0
    ? { latitude: coords[0].latitude, longitude: coords[0].longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }
    : singleBus
    ? { latitude: singleBus.latitude, longitude: singleBus.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }
    : { latitude: 20.5937, longitude: 78.9629, latitudeDelta: 0.02, longitudeDelta: 0.02 };

  const routeLine = myLocation && singleBus
    ? [
        { latitude: singleBus.latitude, longitude: singleBus.longitude },
        { latitude: myLocation.latitude + 0.0003, longitude: myLocation.longitude + 0.0003 },
      ]
    : [];

  const distance = myLocation && singleBus
    ? getDistance(singleBus.latitude, singleBus.longitude, myLocation.latitude, myLocation.longitude)
    : null;

  const busCount = multiBusList.length || (busLocation ? 1 : 0);

  const showMyLocation = useCallback(async () => {
    try {
      const Location = require('expo-location');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setMyLocation(loc);
      mapRef.current?.animateToRegion({ ...loc, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 500);
    } catch (e) {}
  }, []);

  return (
    <View style={[styles.container, { height }, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        customMapStyle={DARK_MAP_STYLE}
        mapType="standard"
        showsUserLocation={false}
        showsCompass={false}
        showsScale={false}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        loadingEnabled
        loadingBackgroundColor={COLORS.surface}
        loadingIndicatorColor={COLORS.primary}
      >
        {coords.length > 1 && (
          <Polyline coordinates={coords} strokeColor={COLORS.primaryLight} strokeWidth={2} lineDashPattern={[6, 8]} />
        )}
        {routeLine.length > 0 && (
          <Polyline coordinates={routeLine} strokeColor="#F59E0B" strokeWidth={3} lineDashPattern={[10, 8]} />
        )}
        {coords.length > 0 && (
          <Marker coordinate={coords[0]} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={[styles.stopMarker, { backgroundColor: COLORS.success }]} />
          </Marker>
        )}
        {coords.length > 1 && (
          <Marker coordinate={coords[coords.length - 1]} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={[styles.stopMarker, { backgroundColor: COLORS.danger }]} />
          </Marker>
        )}

        {multiBusList.length > 0 ? (
          multiBusList.map((bus) => (
            <Marker
              key={bus.tripId}
              coordinate={{ latitude: bus.latitude, longitude: bus.longitude }}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={false}
            >
              <View style={styles.busMarker}>
                <View style={[styles.busMarkerRing, { backgroundColor: bus.color }]}>
                  <Text style={styles.busEmoji}>🚌</Text>
                </View>
                <View style={[styles.busLabel, { backgroundColor: bus.color }]}>
                  <Text style={styles.busLabelText}>{bus.label}</Text>
                </View>
              </View>
            </Marker>
          ))
        ) : (
          busLocation && (
            <Marker coordinate={{ latitude: busLocation.latitude, longitude: busLocation.longitude }} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
              <View style={styles.busMarker}>
                <View style={styles.busMarkerRing}>
                  <Text style={styles.busEmoji}>🚌</Text>
                </View>
                <View style={styles.busLabel}>
                  <Text style={styles.busLabelText}>BUS</Text>
                </View>
              </View>
            </Marker>
          )
        )}

        {myLocation && (
          <Marker coordinate={{ latitude: myLocation.latitude + 0.0003, longitude: myLocation.longitude + 0.0003 }} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <View style={styles.passengerMarker}>
              <View style={styles.passengerMarkerRing}>
                <Text style={styles.passengerEmoji}>📍</Text>
              </View>
              <View style={styles.passengerLabel}>
                <Text style={styles.passengerLabelText}>YOU</Text>
              </View>
            </View>
          </Marker>
        )}
      </MapView>

      <View style={styles.liveBadge}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>LIVE</Text>
      </View>

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
  container: { borderRadius: RADIUS.lg, overflow: 'hidden', backgroundColor: COLORS.surface, ...SHADOWS.card },
  map: { ...StyleSheet.absoluteFillObject },
  busMarker: { width: 44, height: 50, alignItems: 'center' },
  busMarkerRing: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.primary, borderWidth: 3, borderColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 },
  busEmoji: { fontSize: 22 },
  busLabel: { backgroundColor: COLORS.primary, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1, marginTop: 2 },
  busLabelText: { fontSize: 8, fontWeight: '700', color: '#fff' },
  passengerMarker: { width: 36, height: 42, alignItems: 'center' },
  passengerMarkerRing: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.accent, borderWidth: 3, borderColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 6 },
  passengerEmoji: { fontSize: 18 },
  passengerLabel: { backgroundColor: COLORS.accent, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1, marginTop: 2 },
  passengerLabelText: { fontSize: 8, fontWeight: '700', color: '#fff' },
  stopMarker: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#fff' },
  liveBadge: { position: 'absolute', top: SPACING.sm, left: SPACING.sm, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.surface + 'EE', borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 3, borderWidth: 1, borderColor: COLORS.success + '44' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success },
  liveText: { fontSize: 9, fontWeight: TYPOGRAPHY.weights.black, color: COLORS.success, letterSpacing: 1 },
  routeBadge: { position: 'absolute', top: SPACING.sm, right: SPACING.sm, backgroundColor: COLORS.primary + 'DD', borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  routeBadgeText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.textPrimary },
  busCountBadge: {
    position: 'absolute', top: SPACING.sm, alignSelf: 'center',
    backgroundColor: COLORS.primary + 'DD',
    borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm + 2, paddingVertical: 3,
  },
  busCountText: { fontSize: 10, fontWeight: TYPOGRAPHY.weights.bold, color: '#fff' },
  distanceBadge: {
    position: 'absolute', top: 34, alignSelf: 'center',
    backgroundColor: '#F59E0B' + 'DD',
    borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm + 2, paddingVertical: 3,
  },
  distanceText: { fontSize: 10, fontWeight: TYPOGRAPHY.weights.bold, color: '#fff' },
  myLocationBtn: {
    position: 'absolute', bottom: SPACING.sm, right: SPACING.sm,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.accent + 'DD',
    borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm + 2, paddingVertical: 5,
    ...SHADOWS.card,
  },
  myLocationIcon: { fontSize: 14 },
  myLocationText: { fontSize: 10, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.textPrimary },
  legendRow: { position: 'absolute', bottom: SPACING.sm, left: SPACING.sm, flexDirection: 'row', gap: SPACING.sm, backgroundColor: COLORS.surface + 'EE', borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 9, color: COLORS.textSecondary, fontWeight: TYPOGRAPHY.weights.semibold },
  waitingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', gap: SPACING.xs, backgroundColor: COLORS.surface + 'DD' },
  spinnerRing: { width: 32, height: 32, borderRadius: 16, borderWidth: 3, borderColor: COLORS.primary + '33', borderTopColor: COLORS.primary },
  waitingText: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.medium, color: COLORS.textSecondary },
});

export default LiveMap;
