// =============================================================
// src/screens/LoginScreen.jsx – Driver App
// =============================================================

import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, Animated, Alert, Dimensions,
} from 'react-native';

const isWeb = Platform.OS === 'web';
const FORM_MAX_WIDTH = 480;
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();

  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [errors,    setErrors]    = useState({});

  // Button press animation
  const btnScale = useRef(new Animated.Value(1)).current;
  const onPressIn  = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true }).start();

  const validate = () => {
    const errs = {};
    if (!email.trim())    errs.email    = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email.';
    if (!password.trim()) errs.password = 'Password is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(email.trim().toLowerCase(), password);
      if (user.role !== 'DRIVER') {
        Alert.alert('Access Denied', 'This app is for drivers only.');
        return;
      }
      navigation.replace('Dashboard');
    } catch (err) {
      Alert.alert('Login Failed', err.message);
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
              colors={[COLORS.primary, COLORS.accent]}
              style={styles.logoBox}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              <Text style={styles.logoEmoji}>🚌</Text>
            </LinearGradient>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your driver account</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="driver@transitiq.com"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: '' })); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.passwordRow, errors.password && styles.inputError]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: '' })); }}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity onPress={() => setShowPass((v) => !v)} style={styles.eyeBtn}>
                  <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            {/* Login button */}
            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              <TouchableOpacity
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                onPress={handleLogin}
                activeOpacity={0.9}
                disabled={loading}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.loginBtn}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.loginBtnText}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Create Account link */}
            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkRow}>
              <Text style={styles.linkText}>Don't have an account?  </Text>
              <Text style={[styles.linkText, styles.link]}>Create Account →</Text>
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
  scroll:   { flexGrow: 1, padding: SPACING.lg, justifyContent: 'center' },
  centered: {
    width: '100%',
    maxWidth: isWeb ? FORM_MAX_WIDTH : undefined,
    alignSelf: 'center',
  },

  header: { alignItems: 'center', marginBottom: SPACING.xl },
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
  subtitle: { fontSize: TYPOGRAPHY.sizes.md, color: COLORS.textSecondary },

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
  eyeBtn: { padding: SPACING.xs },
  eyeIcon: { fontSize: 18 },

  loginBtn: {
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  loginBtnText: {
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

export default LoginScreen;
