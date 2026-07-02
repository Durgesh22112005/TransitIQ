// =============================================================
// src/screens/DashboardScreen.jsx – Driver App
// =============================================================

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { routeAPI } from '../services/api.service';

const DashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats] = useState({
    tripsToday:    3,
    tripsCompleted: 2,
    hoursOnDuty:   '5h 20m',
    nextTrip:      '2:30 PM',
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // Future: fetch real data
    setTimeout(() => setRefreshing(false), 1000);
  };

  const StatCard = ({ label, value, icon, color }) => (
    <View style={[styles.statCard, { borderTopColor: color || COLORS.primary }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Good Morning 👋</Text>
            <Text style={styles.driverName}>{user?.name || 'Driver'}</Text>
            <StatusBadge label="On Duty" color={COLORS.success} />
          </View>
          <TouchableOpacity style={styles.avatarCircle} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.avatarText}>
              {user?.name?.[0]?.toUpperCase() || 'D'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats row */}
        <Text style={styles.sectionTitle}>Today's Overview</Text>
        <View style={styles.statsRow}>
          <StatCard label="Trips Today"    value={stats.tripsToday}    icon="🚌" color={COLORS.primary} />
          <StatCard label="Completed"      value={stats.tripsCompleted} icon="✅" color={COLORS.success} />
        </View>
        <View style={styles.statsRow}>
          <StatCard label="Hours on Duty"  value={stats.hoursOnDuty}   icon="⏱️" color={COLORS.accent} />
          <StatCard label="Next Trip"      value={stats.nextTrip}       icon="🕒" color={COLORS.warning} />
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('AssignedRoute')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primary + '33', COLORS.primary + '11']}
              style={styles.actionGradient}
            >
              <Text style={styles.actionIcon}>🗺️</Text>
              <Text style={styles.actionLabel}>My Route</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.accent + '33', COLORS.accent + '11']}
              style={styles.actionGradient}
            >
              <Text style={styles.actionIcon}>👤</Text>
              <Text style={styles.actionLabel}>Profile</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Upcoming trip card */}
        <Text style={styles.sectionTitle}>Upcoming Trip</Text>
        <TouchableOpacity
          style={styles.tripCard}
          onPress={() => navigation.navigate('AssignedRoute')}
          activeOpacity={0.9}
        >
          <View style={styles.tripCardRow}>
            <View style={styles.tripRoute}>
              <View style={styles.routeDot} />
              <View style={styles.routeLine} />
              <View style={[styles.routeDot, { backgroundColor: COLORS.accent }]} />
            </View>
            <View style={styles.tripInfo}>
              <View style={styles.tripInfoRow}>
                <View style={[styles.routeDot, { backgroundColor: COLORS.primary }]} />
                <Text style={styles.tripStop}>City Bus Stand</Text>
              </View>
              <View style={styles.tripInfoRow}>
                <View style={[styles.routeDot, { backgroundColor: COLORS.accent }]} />
                <Text style={styles.tripStop}>Airport Terminal 1</Text>
              </View>
            </View>
            <View style={styles.tripMeta}>
              <Text style={styles.tripTime}>2:30 PM</Text>
              <Text style={styles.tripDuration}>45 min</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: { paddingTop: 56, paddingBottom: SPACING.xl, paddingHorizontal: SPACING.lg },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting:    { fontSize: TYPOGRAPHY.sizes.md, color: 'rgba(255,255,255,0.7)' },
  driverName:  { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  avatarCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.textPrimary },

  scroll:       { flex: 1 },
  scrollContent:{ padding: SPACING.lg, paddingBottom: SPACING['3xl'] },

  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },

  statsRow:   { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  statCard:   {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderTopWidth: 3,
    borderTopColor: COLORS.primary,
    ...SHADOWS.card,
    alignItems: 'center',
  },
  statIcon:  { fontSize: 24, marginBottom: SPACING.xs },
  statValue: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.textPrimary },
  statLabel: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textMuted, marginTop: 2 },

  actionsGrid: { flexDirection: 'row', gap: SPACING.sm },
  actionCard:  { flex: 1, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOWS.card },
  actionGradient: { padding: SPACING.lg, alignItems: 'center', gap: SPACING.sm },
  actionIcon:  { fontSize: 32 },
  actionLabel: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.textPrimary },

  tripCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  tripCardRow:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  tripRoute:    { alignItems: 'center', paddingVertical: SPACING.xs },
  routeDot:     { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  routeLine:    { width: 2, height: 30, backgroundColor: COLORS.border, marginVertical: 3 },
  tripInfo:     { flex: 1, gap: SPACING.sm },
  tripInfoRow:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  tripStop:     { fontSize: TYPOGRAPHY.sizes.md, color: COLORS.textPrimary, fontWeight: TYPOGRAPHY.weights.medium },
  tripMeta:     { alignItems: 'flex-end' },
  tripTime:     { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.primary },
  tripDuration: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textMuted },

  logoutBtn: {
    marginTop: SPACING.xl,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.danger + '66',
    alignItems: 'center',
  },
  logoutText: { color: COLORS.danger, fontWeight: TYPOGRAPHY.weights.semibold },
});

export default DashboardScreen;
