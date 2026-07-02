// =============================================================
// src/screens/LoginScreen.jsx – Passenger App
// =============================================================

import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Animated, Alert,
} from 'react-native';

const isWeb = Platform.OS === 'web';
const FORM_MAX_WIDTH = 480;
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});

  const btnScale = useRef(new Animated.Value(1)).current;
  const onPressIn  = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true }).start();

  const validate = () => {
    const e = {};
    if (!email.trim())    e.email    = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email.';
    if (!password.trim()) e.password = 'Password is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      navigation.replace('Home');
    } catch (err) {
      Alert.alert('Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[COLORS.background, '#100A2E']} style={styles.gradient}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.centered}>
          {/* Header */}
          <View style={styles.header}>
            <LinearGradient colors={[COLORS.primary, COLORS.accent]} style={styles.logoBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.logoEmoji}>🚏</Text>
            </LinearGradient>
            <Text style={styles.title}>Sign In</Text>
            <Text style={styles.subtitle}>Plan your next journey</Text>
          </View>

          {/* Form */}
          <View style={styles.card}>
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: '' })); }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email ? <Text style={styles.err}>{errors.email}</Text> : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.pwRow, errors.password && styles.inputError]}>
                <TextInput
                  style={styles.pwInput}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: '' })); }}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity onPress={() => setShowPass((v) => !v)}>
                  <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.err}>{errors.password}</Text> : null}
            </View>

            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              <TouchableOpacity onPressIn={onPressIn} onPressOut={onPressOut} onPress={handleLogin} activeOpacity={0.9} disabled={loading}>
                <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.btnText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkRow}>
              <Text style={styles.linkText}>Don't have an account? </Text>
              <Text style={[styles.linkText, styles.link]}>Create one →</Text>
            </TouchableOpacity>
          </View>
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
  header:   { alignItems: 'center', marginBottom: SPACING.xl },
  logoBox:  {
    width: 80, height: 80, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.md, ...SHADOWS.card,
  },
  logoEmoji: { fontSize: 42 },
  title:     { fontSize: TYPOGRAPHY.sizes['3xl'], fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.textPrimary },
  subtitle:  { fontSize: TYPOGRAPHY.sizes.md, color: COLORS.textSecondary, marginTop: SPACING.xs },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
    ...SHADOWS.card,
  },
  field:   { gap: SPACING.xs },
  label:   { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  input:   {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.md,
    borderWidth: 1, borderColor: COLORS.border,
    ...(isWeb ? { outlineStyle: 'none' } : {}),
  },
  inputError: { borderColor: COLORS.danger },
  err:        { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.danger },
  pwRow:      {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surfaceLight, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  pwInput: { flex: 1, paddingVertical: SPACING.sm + 4, color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.md, ...(isWeb ? { outlineStyle: 'none' } : {}) },
  eyeIcon: { fontSize: 18, padding: SPACING.xs },
  btn:     { borderRadius: RADIUS.md, paddingVertical: SPACING.md, alignItems: 'center', marginTop: SPACING.sm },
  btnText: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, letterSpacing: 1 },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xs },
  linkText:{ fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.textSecondary },
  link:    { color: COLORS.primaryLight, fontWeight: TYPOGRAPHY.weights.semibold },
});

export default LoginScreen;
