// =============================================================
// src/screens/ProfileScreen.jsx – Driver App
// =============================================================

import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

// Mock driver details (will come from API /auth/me in implementation)
const MOCK_DRIVER = {
  licenseNo:  'KA-DL-2019-0042317',
  experience: 7,
  status:     'ACTIVE',
  busRegNo:   'MH 12 AB 1234',
  busModel:   'Volvo B9R',
  joiningDate:'2019-03-15',
};

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View style={styles.infoTexts}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primaryDark, '#0A1A50']}
        style={styles.header}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.accent]}
            style={styles.avatarGradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <Text style={styles.avatarText}>
              {user?.name?.[0]?.toUpperCase() || 'D'}
            </Text>
          </LinearGradient>
          <Text style={styles.profileName}>{user?.name || 'Driver Name'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'driver@transitiq.com'}</Text>
          <StatusBadge
            label={MOCK_DRIVER.status}
            color={MOCK_DRIVER.status === 'ACTIVE' ? COLORS.success : COLORS.warning}
          />
        </View>

        {/* Personal info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          <InfoRow icon="👤" label="Full Name"   value={user?.name  || '—'} />
          <InfoRow icon="📧" label="Email"       value={user?.email || '—'} />
          <InfoRow icon="📱" label="Phone"       value={user?.phone || 'Not provided'} />
          <InfoRow icon="🎂" label="Joined"      value={new Date(MOCK_DRIVER.joiningDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} />
        </View>

        {/* Driver info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Driver Details</Text>
          <InfoRow icon="🪪" label="License No"       value={MOCK_DRIVER.licenseNo} />
          <InfoRow icon="📅" label="Experience"       value={`${MOCK_DRIVER.experience} years`} />
          <InfoRow icon="🟢" label="Status"           value={MOCK_DRIVER.status} />
        </View>

        {/* Assigned bus */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Assigned Bus</Text>
          <InfoRow icon="🚌" label="Registration No" value={MOCK_DRIVER.busRegNo} />
          <InfoRow icon="🏷️" label="Bus Model"       value={MOCK_DRIVER.busModel} />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>🚪  Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    paddingTop: 56, paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row', alignItems: 'center',
  },
  backBtn:     { padding: SPACING.xs, marginRight: SPACING.sm },
  backArrow:   { fontSize: 24, color: COLORS.textPrimary },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.textPrimary },

  scroll:       { flex: 1 },
  scrollContent:{ padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING['3xl'] },

  avatarSection: { alignItems: 'center', marginBottom: SPACING.md },
  avatarGradient: {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.elevated,
  },
  avatarText:   { fontSize: TYPOGRAPHY.sizes['3xl'], fontWeight: TYPOGRAPHY.weights.black, color: COLORS.textPrimary },
  profileName:  { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.textPrimary },
  profileEmail: { fontSize: TYPOGRAPHY.sizes.md, color: COLORS.textSecondary, marginBottom: SPACING.sm },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
    gap: SPACING.md,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: SPACING.xs,
  },

  infoRow:    { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  infoIcon:   { fontSize: 22, width: 32 },
  infoTexts:  { flex: 1, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: SPACING.sm },
  infoLabel:  { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  infoValue:  { fontSize: TYPOGRAPHY.sizes.md, color: COLORS.textPrimary, fontWeight: TYPOGRAPHY.weights.medium, marginTop: 2 },

  logoutBtn: {
    backgroundColor: COLORS.danger + '22',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.danger + '55',
    marginTop: SPACING.sm,
  },
  logoutText: { color: COLORS.danger, fontWeight: TYPOGRAPHY.weights.semibold, fontSize: TYPOGRAPHY.sizes.md },
});

export default ProfileScreen;
