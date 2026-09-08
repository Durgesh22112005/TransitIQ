import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';
import Card from '../components/Card';
import Button from '../components/Button';
import LiveMap from '../components/LiveMap';
import useLocationTracking from '../hooks/useLocationTracking';

const InfoRow = ({ icon, label, value, highlight }) => (
  <View style={[styles.infoRow, highlight && styles.infoRowHighlight]}>
    <Text style={styles.infoIcon}>{icon}</Text>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && styles.infoValueHighlight]}>
        {value ?? '—'}
      </Text>
    </View>
  </View>
);

const ConnectionDot = ({ status }) => {
  const color = status === 'connected' ? COLORS.success : status === 'connecting' ? COLORS.warning : COLORS.danger;
  return <View style={[styles.connDot, { backgroundColor: color }]} />;
};

const LiveTracking = ({ route, navigation }) => {
  const routeParams = route?.params || {};
  const { tripId, driverId, routeId, trip: tripData } = routeParams;

  const {
    location,
    gpsActive,
    connectionStatus,
    error,
    endTrip,
    formatTime,
  } = useLocationTracking(tripId, driverId, routeId, true);

  const handleEndTrip = useCallback(async () => {
    Alert.alert(
      'End Trip',
      'Are you sure you want to end this trip? GPS tracking will stop.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Trip',
          style: 'destructive',
          onPress: async () => {
            const result = await endTrip();
            if (result.success) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs', params: { screen: 'Dashboard' } }],
              });
            } else {
              Alert.alert('Error', result.error || 'Failed to end trip.');
            }
          },
        },
      ]
    );
  }, [endTrip, navigation]);

  const gpsStatus = error ? 'error' : gpsActive ? 'active' : 'inactive';
  const gpsStatusColor = gpsStatus === 'active' ? COLORS.success : gpsStatus === 'error' ? COLORS.danger : COLORS.textMuted;
  const gpsStatusText = gpsStatus === 'active' ? 'GPS Active' : gpsStatus === 'error' ? 'GPS Error' : 'GPS Inactive';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Live Tracking</Text>
          <View style={styles.connStatus}>
            <ConnectionDot status={connectionStatus} />
            <Text style={styles.connText}>
              {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
            </Text>
          </View>
        </View>
        <Text style={styles.headerSub}>
          {tripData?.route?.routeNo || routeId || 'Active Trip'}
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        <LiveMap
          location={location}
          gpsActive={gpsActive && !error}
          height={230}
        />

        <Card padding={SPACING.md}>
          <View style={styles.timerSection}>
            <Text style={styles.timerLabel}>Trip Duration</Text>
            <Text style={styles.timerValue}>{formatTime}</Text>
          </View>
        </Card>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Card padding={SPACING.md}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Location Data</Text>
            <View style={[styles.gpsBadge, { borderColor: gpsStatusColor + '40' }]}>
              <View style={[styles.gpsDot, { backgroundColor: gpsStatusColor }]} />
              <Text style={[styles.gpsText, { color: gpsStatusColor }]}>{gpsStatusText}</Text>
            </View>
          </View>
          <InfoRow icon="🌐" label="Latitude" value={location?.latitude?.toFixed(6)} />
          <InfoRow icon="🌐" label="Longitude" value={location?.longitude?.toFixed(6)} />
          <InfoRow
            icon="💨" label="Speed"
            value={location?.speed != null ? `${(location.speed * 3.6).toFixed(1)} km/h` : '0 km/h'}
          />
          <InfoRow
            icon="🧭" label="Heading"
            value={location?.heading != null ? `${location.heading.toFixed(1)}°` : '—'}
          />
          <InfoRow
            icon="⛰️" label="Altitude"
            value={location?.altitude != null ? `${location.altitude.toFixed(1)} m` : '—'}
          />
          <InfoRow
            icon="🎯" label="GPS Accuracy"
            value={location?.accuracy != null ? `±${location.accuracy.toFixed(0)} m` : '—'}
            highlight={location?.accuracy != null && location.accuracy > 50}
          />
        </Card>

        <Card padding={SPACING.md}>
          <Text style={styles.sectionTitle}>Connection</Text>
          <InfoRow
            icon="📡" label="Socket"
            value={connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'connecting' ? 'Reconnecting...' : 'Disconnected'}
            highlight={connectionStatus !== 'connected'}
          />
          <InfoRow
            icon="📍" label="GPS"
            value={gpsActive ? 'Active' : error ? 'Error' : 'Waiting'}
            highlight={!gpsActive}
          />
        </Card>

        {(tripData?.bus || tripData?.route) && (
          <Card padding={SPACING.md}>
            <Text style={styles.sectionTitle}>Trip Details</Text>
            {tripData?.route && (
              <>
                <InfoRow icon="🛣️" label="Route" value={tripData.route.name} />
                <InfoRow icon="🔢" label="Route No" value={tripData.route.routeNo} />
                <InfoRow icon="📍" label="From" value={tripData.route.startLocation} />
                <InfoRow icon="🏁" label="To" value={tripData.route.endLocation} />
                {tripData.route.distance && <InfoRow icon="📏" label="Distance" value={`${tripData.route.distance} km`} />}
                {tripData.route.duration && <InfoRow icon="⏱️" label="Duration" value={`${tripData.route.duration} min`} />}
              </>
            )}
            {tripData?.bus && (
              <>
                <View style={styles.divider} />
                <InfoRow icon="🚌" label="Bus Reg" value={tripData.bus.regNo} />
                <InfoRow icon="🏷️" label="Model" value={tripData.bus.model} />
                <InfoRow icon="👥" label="Capacity" value={`${tripData.bus.capacity} seats`} />
              </>
            )}
          </Card>
        )}

        <Button
          title="End Trip"
          onPress={handleEndTrip}
          variant="danger"
          icon="⏹️"
          style={styles.endBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING['3xl'] },

  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: RADIUS['2xl'],
    borderBottomRightRadius: RADIUS['2xl'],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textWhite,
  },
  connStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  connDot: { width: 8, height: 8, borderRadius: 4 },
  connText: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textWhite, fontWeight: TYPOGRAPHY.weights.semibold },
  headerSub: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: SPACING.xs,
  },

  timerSection: { alignItems: 'center', paddingVertical: SPACING.sm },
  timerLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timerValue: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.primary,
    fontVariant: ['tabular-nums'],
    marginTop: SPACING.xs,
  },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.danger + '30',
    gap: SPACING.sm,
  },
  errorIcon: { fontSize: 16 },
  errorText: { flex: 1, fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.danger, fontWeight: TYPOGRAPHY.weights.medium },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },

  divider: { height: 1, backgroundColor: COLORS.border + '66', marginVertical: SPACING.sm },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoRowHighlight: {
    backgroundColor: COLORS.warningBg,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.xs,
  },
  infoIcon: { fontSize: 16, width: 26, textAlign: 'center' },
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
    fontVariant: ['tabular-nums'],
  },
  infoValueHighlight: { color: COLORS.warning },

  gpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  gpsDot: { width: 6, height: 6, borderRadius: 3 },
  gpsText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold },

  endBtn: { marginTop: SPACING.md },
});

export default LiveTracking;
