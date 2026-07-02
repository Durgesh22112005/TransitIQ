// =============================================================
// src/screens/RegisterScreen.jsx – Passenger App
// =============================================================

import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Animated, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const isWeb = Platform.OS === 'web';
const FORM_MAX_WIDTH = 480;

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});

  const btnScale = useRef(new Animated.Value(1)).current;
  const onPressIn  = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true }).start();

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.length < 2)   e.name    = 'Name must be at least 2 characters.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.';
    if (form.password.length < 8)                     e.password = 'Password must be at least 8 characters.';
    else if (!/[A-Z]/.test(form.password))            e.password = 'Password must contain at least one uppercase letter.';
    else if (!/\d/.test(form.password))               e.password = 'Password must contain at least one number.';
    if (form.password !== form.confirmPassword)        e.confirmPassword = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.name.trim(), form.email.trim().toLowerCase(), form.password, form.phone.trim() || undefined);
      navigation.replace('Home');
    } catch (err) {
      Alert.alert('Registration Failed', err.message);
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
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Text style={styles.backArrow}>←</Text>
              </TouchableOpacity>
              <View style={styles.headerText}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Start your smart transit journey</Text>
              </View>
            </View>

            {/* Progress chips */}
            <View style={styles.progressRow}>
              {['Personal', 'Security', 'Done'].map((step, i) => (
                <View key={step} style={[styles.chip, i === 0 && styles.chipActive]}>
                  <Text style={[styles.chipText, i === 0 && styles.chipTextActive]}>{step}</Text>
                </View>
              ))}
            </View>

            {/* Form */}
            <View style={styles.card}>
              {/* Full Name */}
              <View style={styles.field}>
                <Text style={styles.label}>Full Name</Text>
                <View style={[styles.inputWrap, errors.name && styles.inputError]}>
                  <TextInput
                    style={styles.input}
                    placeholder="John Doe"
                    placeholderTextColor={COLORS.textMuted}
                    value={form.name}
                    onChangeText={(v) => set('name', v)}
                    autoCapitalize="words"
                  />
                </View>
                {errors.name ? <Text style={styles.err}>{errors.name}</Text> : null}
              </View>

              {/* Email */}
              <View style={styles.field}>
                <Text style={styles.label}>Email Address</Text>
                <View style={[styles.inputWrap, errors.email && styles.inputError]}>
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor={COLORS.textMuted}
                    value={form.email}
                    onChangeText={(v) => set('email', v)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {errors.email ? <Text style={styles.err}>{errors.email}</Text> : null}
              </View>

              {/* Phone */}
              <View style={styles.field}>
                <Text style={styles.label}>Phone (optional)</Text>
                <View style={[styles.inputWrap, errors.phone && styles.inputError]}>
                  <TextInput
                    style={styles.input}
                    placeholder="+91 98765 43210"
                    placeholderTextColor={COLORS.textMuted}
                    value={form.phone}
                    onChangeText={(v) => set('phone', v)}
                    keyboardType="phone-pad"
                  />
                </View>
                {errors.phone ? <Text style={styles.err}>{errors.phone}</Text> : null}
              </View>

              {/* Password */}
              <View style={styles.field}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.inputWrap, errors.password && styles.inputError]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Min. 8 characters"
                    placeholderTextColor={COLORS.textMuted}
                    value={form.password}
                    onChangeText={(v) => set('password', v)}
                    secureTextEntry={!showPass}
                  />
                  <TouchableOpacity onPress={() => setShowPass((v) => !v)}>
                    <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
                {errors.password ? <Text style={styles.err}>{errors.password}</Text> : null}
              </View>

              {/* Confirm Password */}
              <View style={styles.field}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={[styles.inputWrap, errors.confirmPassword && styles.inputError]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter password"
                    placeholderTextColor={COLORS.textMuted}
                    value={form.confirmPassword}
                    onChangeText={(v) => set('confirmPassword', v)}
                    secureTextEntry={!showPass}
                  />
                </View>
                {errors.confirmPassword ? <Text style={styles.err}>{errors.confirmPassword}</Text> : null}
              </View>

              <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                <TouchableOpacity onPressIn={onPressIn} onPressOut={onPressOut} onPress={handleRegister} activeOpacity={0.9} disabled={loading}>
                  <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Text style={styles.btnText}>{loading ? 'Creating account...' : 'Create Account'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkRow}>
                <Text style={styles.linkText}>Already have an account? </Text>
                <Text style={[styles.linkText, styles.link]}>Sign In →</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.terms}>
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </Text>
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

  header:     { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg, marginTop: SPACING.lg },
  backBtn:    { marginRight: SPACING.md, padding: SPACING.xs },
  backArrow:  { fontSize: 24, color: COLORS.textPrimary },
  headerText: { flex: 1 },
  title:      { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.textPrimary },
  subtitle:   { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },

  progressRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  chip:         { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, backgroundColor: COLORS.surfaceLight, borderWidth: 1, borderColor: COLORS.border },
  chipActive:   { backgroundColor: COLORS.primary + '33', borderColor: COLORS.primary },
  chipText:     { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textMuted, fontWeight: TYPOGRAPHY.weights.medium },
  chipTextActive:{ color: COLORS.primaryLight },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1, borderColor: COLORS.border,
    gap: SPACING.md, ...SHADOWS.card,
  },
  field:      { gap: SPACING.xs },
  label:      { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  inputWrap:  {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surfaceLight, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: SPACING.md,
  },
  input:      {
    flex: 1, paddingVertical: SPACING.sm + 4, color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.md,
    ...(isWeb ? { outlineStyle: 'none' } : {}),
  },
  inputError: { borderColor: COLORS.danger },
  err:        { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.danger },
  eyeIcon:    { fontSize: 18, paddingLeft: SPACING.sm },

  btn:    { borderRadius: RADIUS.md, paddingVertical: SPACING.md, alignItems: 'center', marginTop: SPACING.sm },
  btnText:{ color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold },

  linkRow:  { flexDirection: 'row', justifyContent: 'center' },
  linkText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.textSecondary },
  link:     { color: COLORS.primaryLight, fontWeight: TYPOGRAPHY.weights.semibold },

  terms: { textAlign: 'center', color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs, marginTop: SPACING.lg, paddingHorizontal: SPACING.md },
});

export default RegisterScreen;
