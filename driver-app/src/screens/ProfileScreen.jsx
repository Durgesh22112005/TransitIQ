import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, Animated, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, GLASS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, ANIMATION } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api.service';
import Card from '../components/Card';
import GlassView from '../components/GlassView';
import GlassBackground from '../components/GlassBackground';
import Button from '../components/Button';
import { LoadingSpinner } from '../components/LoadingOverlay';
import ErrorState from '../components/ErrorState';

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={16} color={COLORS.textMuted} style={styles.infoIcon} />
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

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const avatarScale = useRef(new Animated.Value(0.8)).current;

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

  useEffect(() => {
    if (!loading && profile) {
      Animated.parallel([
        Animated.timing(headerFade, {
          toValue: 1,
          duration: ANIMATION.fadeIn,
          useNativeDriver: true,
        }),
        Animated.timing(headerSlide, {
          toValue: 0,
          duration: ANIMATION.slideUp,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(avatarScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, profile]);

  const handleLogout = () => {
    logout();
  };

  const driver = profile?.driver;

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={() => { setLoading(true); setError(null); }} />;

  return (
    <GlassBackground>
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={GRADIENTS.header}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View style={[styles.avatarSection, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
            <Animated.View style={[styles.avatarOuter, { transform: [{ scale: avatarScale }] }]}>
              <GlassView intensity={30} tint="dark" style={styles.avatarGradient}>
                <Text style={styles.avatarText}>
                  {profile?.name?.[0]?.toUpperCase() || 'D'}
                </Text>
              </GlassView>
            </Animated.View>
            <Text style={styles.profileName}>{profile?.name || 'Driver'}</Text>
            <Text style={styles.profileEmail}>{profile?.email || ''}</Text>
            {driver && (
              <GlassView intensity={20} tint="dark" style={styles.driverIdBadge}>
                <Ionicons name="shield-checkmark" size={12} color={COLORS.primaryLight} />
                <Text style={styles.driverIdText}>ID: {driver.id?.slice(0, 8)?.toUpperCase() || '—'}</Text>
              </GlassView>
            )}
          </Animated.View>
        </LinearGradient>

        <Card padding={SPACING.md} delay={150}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="person" size={16} color={COLORS.primaryLight} />
            <Text style={styles.cardTitle}>Personal Information</Text>
          </View>
          <InfoRow icon="person-outline" label="Full Name" value={profile?.name} />
          <InfoRow icon="mail-outline" label="Email" value={profile?.email} />
          <InfoRow icon="call-outline" label="Phone" value={profile?.phone || 'Not provided'} />
          <InfoRow icon="calendar-outline" label="Joined" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
        </Card>

        {driver && (
          <>
            <Card padding={SPACING.md} delay={230}>
              <View style={styles.cardTitleRow}>
                <Ionicons name="id-card" size={16} color={COLORS.primaryLight} />
                <Text style={styles.cardTitle}>Driver Details</Text>
              </View>
              <InfoRow icon="card-outline" label="License No" value={driver.licenseNo} />
              <InfoRow icon="calendar-outline" label="Experience" value={driver.experience ? `${driver.experience} years` : '—'} />
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

            <Card padding={SPACING.md} delay={310}>
              <View style={styles.cardTitleRow}>
                <Ionicons name="bus" size={16} color={COLORS.primaryLight} />
                <Text style={styles.cardTitle}>Assigned Bus</Text>
              </View>
              {driver.assignedBus ? (
                <>
                  <InfoRow icon="bus-outline" label="Registration" value={driver.assignedBus.regNo} />
                  <InfoRow icon="pricetag-outline" label="Model" value={driver.assignedBus.model} />
                  <InfoRow icon="people-outline" label="Capacity" value={`${driver.assignedBus.capacity} seats`} />
                </>
              ) : (
                <Text style={styles.mutedText}>No bus assigned</Text>
              )}
            </Card>
          </>
        )}

        <Card padding={SPACING.md} delay={390}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="key" size={16} color={COLORS.primaryLight} />
            <Text style={styles.cardTitle}>Account</Text>
          </View>
          <InfoRow icon="shield-outline" label="Role" value={profile?.role || user?.role || '—'} />
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
    </GlassBackground>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: SPACING['3xl'] },

  header: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING['2xl'],
    borderBottomLeftRadius: RADIUS['2xl'],
    borderBottomRightRadius: RADIUS['2xl'],
  },
  avatarSection: { alignItems: 'center', gap: SPACING.sm },
  avatarOuter: {
    padding: 3,
    borderRadius: 52,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarGradient: {
    width: 96, height: 96, borderRadius: 48,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.primary,
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
    marginTop: SPACING.xs,
  },
  profileEmail: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  driverIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
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

  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
    marginBottom: SPACING.xs,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primaryLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm - 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoIcon: { width: 20, textAlign: 'center' },
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
