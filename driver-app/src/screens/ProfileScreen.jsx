import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api.service';
import Card from '../components/Card';
import Button from '../components/Button';
import { LoadingSpinner } from '../components/LoadingOverlay';
import ErrorState from '../components/ErrorState';

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoIcon}>{icon}</Text>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  </View>
);

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setError(null);
        const response = await authAPI.getMe();
        setProfile(response?.data || null);
      } catch (err) {
        setError(err.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
  };

  const driver = profile?.driver;

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={() => { setLoading(true); setError(null); }} />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
          <View style={styles.avatarSection}>
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {profile?.name?.[0]?.toUpperCase() || 'D'}
              </Text>
            </LinearGradient>
            <Text style={styles.profileName}>{profile?.name || 'Driver'}</Text>
            <Text style={styles.profileEmail}>{profile?.email || ''}</Text>
            {driver && (
              <View style={styles.driverIdBadge}>
                <Text style={styles.driverIdText}>ID: {driver.id?.slice(0, 8)?.toUpperCase() || '—'}</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        <Card padding={SPACING.md}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          <InfoRow icon="👤" label="Full Name" value={profile?.name} />
          <InfoRow icon="📧" label="Email" value={profile?.email} />
          <InfoRow icon="📱" label="Phone" value={profile?.phone || 'Not provided'} />
          <InfoRow icon="🎂" label="Joined" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
        </Card>

        {driver && (
          <>
            <Card padding={SPACING.md}>
              <Text style={styles.cardTitle}>Driver Details</Text>
              <InfoRow icon="🪪" label="License No" value={driver.licenseNo} />
              <InfoRow icon="📅" label="Experience" value={driver.experience ? `${driver.experience} years` : '—'} />
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Status</Text>
                <View style={[styles.statusBadge, {
                  backgroundColor: driver.status === 'ACTIVE' ? COLORS.successBg : COLORS.warningBg,
                  borderColor: driver.status === 'ACTIVE' ? COLORS.success + '40' : COLORS.warning + '40',
                }]}>
                  <View style={[styles.statusDot, {
                    backgroundColor: driver.status === 'ACTIVE' ? COLORS.success : COLORS.warning,
                  }]} />
                  <Text style={[styles.statusText, {
                    color: driver.status === 'ACTIVE' ? COLORS.success : COLORS.warning,
                  }]}>{driver.status}</Text>
                </View>
              </View>
            </Card>

            <Card padding={SPACING.md}>
              <Text style={styles.cardTitle}>Assigned Bus</Text>
              {driver.assignedBus ? (
                <>
                  <InfoRow icon="🚌" label="Registration" value={driver.assignedBus.regNo} />
                  <InfoRow icon="🏷️" label="Model" value={driver.assignedBus.model} />
                  <InfoRow icon="👥" label="Capacity" value={`${driver.assignedBus.capacity} seats`} />
                </>
              ) : (
                <Text style={styles.mutedText}>No bus assigned</Text>
              )}
            </Card>
          </>
        )}

        <Card padding={SPACING.md}>
          <Text style={styles.cardTitle}>Account</Text>
          <InfoRow icon="👤" label="Role" value={profile?.role || user?.role || '—'} />
        </Card>

        <View style={styles.logoutSection}>
          <Button
            title="Sign Out"
            onPress={handleLogout}
            variant="danger"
            icon="🚪"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: SPACING['3xl'] },

  header: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING['2xl'],
    borderBottomLeftRadius: RADIUS['2xl'],
    borderBottomRightRadius: RADIUS['2xl'],
  },
  avatarSection: { alignItems: 'center', gap: SPACING.sm },
  avatarGradient: {
    width: 96, height: 96, borderRadius: 48,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.textWhite,
  },
  profileName: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textWhite,
  },
  profileEmail: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  driverIdBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginTop: SPACING.xs,
  },
  driverIdText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textWhite,
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: 0.5,
  },

  cardTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoIcon: { fontSize: 18, width: 28 },
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
  },
  mutedText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },

  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  statusLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold },

  logoutSection: {
    padding: SPACING.lg,
    marginTop: SPACING.sm,
  },
});

export default ProfileScreen;
