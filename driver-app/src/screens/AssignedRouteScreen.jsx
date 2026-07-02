// =============================================================
// src/screens/AssignedRouteScreen.jsx – Driver App
// Displays the driver's assigned route with all stops.
// Start Trip button is UI only (no socket/GPS in Phase 1).
// =============================================================

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import TripButton from '../components/TripButton';
import StatusBadge from '../components/StatusBadge';

// ─── Mock data (replace with API in later phase) ────────────
const MOCK_ROUTE = {
  routeNo:       'R-042',
  name:          'City Centre – Airport Express',
  startLocation: 'City Bus Stand',
  endLocation:   'Airport Terminal 1',
  distance:      '32 km',
  duration:      '45 min',
  status:        'ACTIVE',
  stops: [
    { id: '1', sequence: 1, name: 'City Bus Stand',         landmark: 'Near Clock Tower' },
    { id: '2', sequence: 2, name: 'MG Road Junction',       landmark: 'Opposite KFC' },
    { id: '3', sequence: 3, name: 'Railway Station Gate 2',  landmark: 'Platform side' },
    { id: '4', sequence: 4, name: 'Electronic City',         landmark: 'Flyover end' },
    { id: '5', sequence: 5, name: 'Silk Board Signal',       landmark: 'Near Petrol bunk' },
    { id: '6', sequence: 6, name: 'Airport Terminal 1',      landmark: 'Departure gate' },
  ],
};

const AssignedRouteScreen = ({ navigation }) => {
  const [tripStarted, setTripStarted] = useState(false);
  const [currentStop, setCurrentStop] = useState(0);

  const handleStartTrip = () => {
    Alert.alert(
      'Start Trip',
      `Start Route ${MOCK_ROUTE.routeNo}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => {
            setTripStarted(true);
            Alert.alert('Trip Started 🚌', 'Have a safe journey!');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary]}
        style={styles.header}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assigned Route</Text>
        <StatusBadge label={MOCK_ROUTE.status} color={COLORS.success} />
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Route summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.routeNo}>{MOCK_ROUTE.routeNo}</Text>
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>{MOCK_ROUTE.distance}</Text>
            </View>
          </View>
          <Text style={styles.routeName}>{MOCK_ROUTE.name}</Text>

          <View style={styles.endpointsRow}>
            <View style={styles.endpoint}>
              <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
              <Text style={styles.endpointText}>{MOCK_ROUTE.startLocation}</Text>
            </View>
            <View style={styles.dottedLine} />
            <View style={styles.endpoint}>
              <View style={[styles.dot, { backgroundColor: COLORS.danger }]} />
              <Text style={styles.endpointText}>{MOCK_ROUTE.endLocation}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📍</Text>
              <Text style={styles.metaValue}>{MOCK_ROUTE.stops.length} Stops</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>⏱️</Text>
              <Text style={styles.metaValue}>{MOCK_ROUTE.duration}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>🚌</Text>
              <Text style={styles.metaValue}>Bus #MH12AB1234</Text>
            </View>
          </View>
        </View>

        {/* Map placeholder */}
        <View style={styles.mapPlaceholder}>
          <LinearGradient
            colors={[COLORS.surfaceLight, COLORS.surface]}
            style={styles.mapGradient}
          >
            <Text style={styles.mapEmoji}>🗺️</Text>
            <Text style={styles.mapText}>Live Map</Text>
            <Text style={styles.mapSub}>Available in Phase 2</Text>
          </LinearGradient>
        </View>

        {/* Stops list */}
        <Text style={styles.sectionTitle}>Route Stops</Text>
        <View style={styles.stopsList}>
          {MOCK_ROUTE.stops.map((stop, idx) => (
            <View key={stop.id} style={styles.stopItem}>
              {/* Timeline */}
              <View style={styles.timeline}>
                <View style={[
                  styles.stopDot,
                  idx === 0 && { backgroundColor: COLORS.success, width: 16, height: 16 },
                  idx === MOCK_ROUTE.stops.length - 1 && { backgroundColor: COLORS.danger, width: 16, height: 16 },
                  tripStarted && idx === currentStop && { backgroundColor: COLORS.primary, width: 18, height: 18 },
                ]} />
                {idx < MOCK_ROUTE.stops.length - 1 && <View style={styles.stopLine} />}
              </View>

              {/* Stop info */}
              <View style={styles.stopInfo}>
                <Text style={styles.stopName}>{stop.name}</Text>
                {stop.landmark ? (
                  <Text style={styles.stopLandmark}>📍 {stop.landmark}</Text>
                ) : null}
              </View>

              <Text style={styles.stopSeq}>#{stop.sequence}</Text>
            </View>
          ))}
        </View>

        {/* Spacer for button */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky Start Trip button */}
      <View style={styles.bottomBar}>
        <TripButton
          started={tripStarted}
          onPress={handleStartTrip}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    paddingTop: 56, paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
  },
  backBtn:    { padding: SPACING.xs },
  backArrow:  { fontSize: 24, color: COLORS.textPrimary },
  headerTitle: { flex: 1, fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.textPrimary },

  scroll:       { flex: 1 },
  scrollContent:{ padding: SPACING.lg },

  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
    gap: SPACING.sm,
  },
  summaryRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  routeNo:       { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.black, color: COLORS.primary },
  distanceBadge: {
    backgroundColor: COLORS.primary + '22',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  distanceText:  { color: COLORS.primary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  routeName:     { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.textPrimary },

  endpointsRow:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.xs },
  endpoint:      { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  dot:           { width: 10, height: 10, borderRadius: 5 },
  endpointText:  { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.textSecondary },
  dottedLine:    { flex: 1, height: 1, borderStyle: 'dashed', borderTopWidth: 1, borderColor: COLORS.border },

  metaRow:       { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.xs },
  metaItem:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaIcon:      { fontSize: 14 },
  metaValue:     { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textSecondary },

  mapPlaceholder: { marginTop: SPACING.md, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOWS.card },
  mapGradient: {
    height: 180, justifyContent: 'center', alignItems: 'center', gap: SPACING.xs,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg,
  },
  mapEmoji:  { fontSize: 48 },
  mapText:   { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.textSecondary },
  mapSub:    { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textMuted },

  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },

  stopsList: { gap: 0 },
  stopItem:  { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  timeline:  { alignItems: 'center', width: 20 },
  stopDot:   { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.border, marginTop: 4 },
  stopLine:  { width: 2, flex: 1, backgroundColor: COLORS.border, minHeight: 40 },
  stopInfo:  { flex: 1, paddingBottom: SPACING.lg },
  stopName:  { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.textPrimary },
  stopLandmark: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.textMuted, marginTop: 2 },
  stopSeq:   { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textMuted, marginTop: 4 },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
});

export default AssignedRouteScreen;
