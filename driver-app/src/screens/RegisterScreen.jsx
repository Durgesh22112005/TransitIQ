// =============================================================
// src/screens/RegisterScreen.jsx – Driver App
// =============================================================

import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, Animated, Alert, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const FORM_MAX_WIDTH = 480;

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: '', email: '', phone: '', licenseNo: '',
    password: '', confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});

  // Button press animation
  const btnScale = useRef(new Animated.Value(1)).current;
  const onPressIn  = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true }).start();

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.length < 2)
      e.name = 'Name must be at least 2 characters.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      e.email = 'Enter a valid email.';
    if (form.password.length < 8)
      e.password = 'Password must be at least 8 characters.';
    else if (!/[A-Z]/.test(form.password))
      e.password = 'Must contain at least one uppercase letter.';
    else if (!/\d/.test(form.password))
      e.password = 'Must contain at least one number.';
    if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        role: 'DRIVER',
      });
      navigation.replace('Dashboard');
    } catch (err) {
      Alert.alert('Registration Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[COLORS.background, '#0D1B3E']} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.centered}>
            {/* Header */}
            <View style={styles.header}>
              <LinearGradient
                colors={[COLORS.accent, COLORS.primary]}
                style={styles.logoBox}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              >
                <Text style={styles.logoEmoji}>🪪</Text>
              </LinearGradient>
              <Text style={styles.title}>Join as Driver</Text>
              <Text style={styles.subtitle}>Create your driver account to get started</Text>
            </View>

            {/* Card */}
            <View style={styles.card}>
              {/* Full Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="John Doe"
                  placeholderTextColor={COLORS.textMuted}
                  value={form.name}
                  onChangeText={(v) => set('name', v)}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
              </View>

              {/* Email */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="driver@transitiq.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={form.email}
                  onChangeText={(v) => set('email', v)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
              </View>

              {/* Phone */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Phone (optional)</Text>
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  placeholder="+91 98765 43210"
                  placeholderTextColor={COLORS.textMuted}
                  value={form.phone}
                  onChangeText={(v) => set('phone', v)}
                  keyboardType="phone-pad"
                  autoCorrect={false}
                />
                {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
              </View>

              {/* License Number */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>License Number (optional)</Text>
                <TextInput
                  style={[styles.input, errors.licenseNo && styles.inputError]}
                  placeholder="DL-01-2025-0012345"
                  placeholderTextColor={COLORS.textMuted}
                  value={form.licenseNo}
                  onChangeText={(v) => set('licenseNo', v)}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
                {errors.licenseNo ? <Text style={styles.errorText}>{errors.licenseNo}</Text> : null}
              </View>

              {/* Password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.passwordRow, errors.password && styles.inputError]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Min. 8 chars, 1 uppercase, 1 number"
                    placeholderTextColor={COLORS.textMuted}
                    value={form.password}
                    onChangeText={(v) => set('password', v)}
                    secureTextEntry={!showPass}
                  />
                  <TouchableOpacity onPress={() => setShowPass((v) => !v)} style={styles.eyeBtn}>
                    <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
                {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
              </View>

              {/* Confirm Password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={[styles.passwordRow, errors.confirmPassword && styles.inputError]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Re-enter password"
                    placeholderTextColor={COLORS.textMuted}
                    value={form.confirmPassword}
                    onChangeText={(v) => set('confirmPassword', v)}
                    secureTextEntry={!showPass}
                  />
                </View>
                {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
              </View>

              {/* Password requirements hint */}
              <View style={styles.hintBox}>
                <Text style={styles.hintTitle}>Password must contain:</Text>
                <Text style={[styles.hintItem, form.password.length >= 8 && styles.hintValid]}>
                  {form.password.length >= 8 ? '✓' : '○'}  At least 8 characters
                </Text>
                <Text style={[styles.hintItem, /[A-Z]/.test(form.password) && styles.hintValid]}>
                  {/[A-Z]/.test(form.password) ? '✓' : '○'}  One uppercase letter
                </Text>
                <Text style={[styles.hintItem, /\d/.test(form.password) && styles.hintValid]}>
                  {/\d/.test(form.password) ? '✓' : '○'}  One number
                </Text>
              </View>

              {/* Register button */}
              <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                <TouchableOpacity
                  onPressIn={onPressIn}
                  onPressOut={onPressOut}
                  onPress={handleRegister}
                  activeOpacity={0.9}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={[COLORS.accent, COLORS.accentDark]}
                    style={styles.registerBtn}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.registerBtnText}>
                      {loading ? 'Creating Account...' : 'Create Driver Account'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Sign In link */}
              <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkRow}>
                <Text style={styles.linkText}>Already have an account?  </Text>
                <Text style={[styles.linkText, styles.link]}>Sign In →</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.footerText}>TransitIQ Driver Portal v1.0</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex:     { flex: 1 },
  scroll:   { flexGrow: 1, padding: SPACING.lg, paddingBottom: SPACING['3xl'] },
  centered: {
    width: '100%',
    maxWidth: isWeb ? FORM_MAX_WIDTH : undefined,
    alignSelf: 'center',
  },

  header: { alignItems: 'center', marginBottom: SPACING.xl, marginTop: SPACING.lg },
  logoBox: {
    width: 80, height: 80, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  logoEmoji: { fontSize: 40 },
  title: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: { fontSize: TYPOGRAPHY.sizes.md, color: COLORS.textSecondary, textAlign: 'center' },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
    gap: SPACING.md,
  },

  fieldGroup: { gap: SPACING.xs },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...(isWeb ? { outlineStyle: 'none' } : {}),
  },
  inputError: { borderColor: COLORS.danger },
  errorText:  { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.danger },

  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: SPACING.sm + 4,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.md,
    ...(isWeb ? { outlineStyle: 'none' } : {}),
  },
  eyeBtn:  { padding: SPACING.xs },
  eyeIcon: { fontSize: 18 },

  hintBox: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm + 4,
    gap: 4,
  },
  hintTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: 2,
  },
  hintItem: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textMuted,
  },
  hintValid: {
    color: COLORS.success,
  },

  registerBtn: {
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  registerBtnText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 1,
  },

  linkRow:  { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xs },
  linkText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.textSecondary },
  link:     { color: COLORS.primaryLight, fontWeight: TYPOGRAPHY.weights.semibold },

  footerText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: SPACING.xl,
  },
});

export default RegisterScreen;
