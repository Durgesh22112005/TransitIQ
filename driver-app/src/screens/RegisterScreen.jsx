import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, Animated, Alert, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, GLASS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, ANIMATION } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import GlassView from '../components/GlassView';

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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATION.fadeIn,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: ANIMATION.slideUp,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.parallel([
      Animated.timing(cardFade, {
        toValue: 1,
        duration: ANIMATION.fadeIn,
        delay: 150,
        useNativeDriver: true,
      }),
      Animated.timing(cardSlide, {
        toValue: 0,
        duration: ANIMATION.slideUp,
        delay: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
      navigation.replace('MainTabs');
    } catch (err) {
      Alert.alert('Registration Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (() => {
    let score = 0;
    if (form.password.length >= 8) score++;
    if (/[A-Z]/.test(form.password)) score++;
    if (/\d/.test(form.password)) score++;
    if (/[^A-Za-z0-9]/.test(form.password)) score++;
    return score;
  })();

  const strengthColors = [COLORS.danger, COLORS.danger, COLORS.warning, COLORS.success, COLORS.success];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];

  const InputField = ({ label, value, onChangeText, placeholder, error, secure, keyboardType, showPass, onTogglePass, editable, icon }) => {
    const [focused, setFocused] = useState(false);

    return (
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>{label}</Text>
        <GlassView intensity={15} tint="dark" style={[styles.inputRow, error && styles.inputError, focused && styles.inputFocused]}>
          <Ionicons name={icon} size={18} color={focused ? COLORS.primary : COLORS.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.passwordInput}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textMuted}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secure && !showPass}
            keyboardType={keyboardType}
            autoCapitalize={secure ? 'none' : 'words'}
            autoCorrect={false}
            editable={editable}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          {secure && (
            <TouchableOpacity onPress={onTogglePass} style={styles.eyeBtn}>
              <Ionicons name={showPass ? 'eye-off' : 'eye'} size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </GlassView>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  };

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.centered}>
            <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <LinearGradient
                colors={GRADIENTS.accent}
                style={styles.logoBox}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              >
                <Ionicons name="card" size={36} color={COLORS.textWhite} />
              </LinearGradient>
              <Text style={styles.title}>Join as Driver</Text>
              <Text style={styles.subtitle}>Create your driver account to get started</Text>
            </Animated.View>

            <Animated.View style={[styles.card, { opacity: cardFade, transform: [{ translateY: cardSlide }] }]}>
              <GlassView intensity={25} tint="dark" style={styles.cardGlass}>
              <InputField
                label="Full Name"
                value={form.name}
                onChangeText={(v) => set('name', v)}
                placeholder="John Doe"
                error={errors.name}
                editable={!loading}
                icon="person-outline"
              />

              <InputField
                label="Email Address"
                value={form.email}
                onChangeText={(v) => set('email', v)}
                placeholder="driver@transitiq.com"
                error={errors.email}
                keyboardType="email-address"
                editable={!loading}
                icon="mail-outline"
              />

              <InputField
                label="Phone (optional)"
                value={form.phone}
                onChangeText={(v) => set('phone', v)}
                placeholder="+91 98765 43210"
                error={errors.phone}
                keyboardType="phone-pad"
                editable={!loading}
                icon="call-outline"
              />

              <InputField
                label="License Number (optional)"
                value={form.licenseNo}
                onChangeText={(v) => set('licenseNo', v)}
                placeholder="DL-01-2025-0012345"
                error={errors.licenseNo}
                editable={!loading}
                icon="card-outline"
              />

              <InputField
                label="Password"
                value={form.password}
                onChangeText={(v) => set('password', v)}
                placeholder="Min. 8 chars, 1 uppercase, 1 number"
                error={errors.password}
                secure
                showPass={showPass}
                onTogglePass={() => setShowPass((v) => !v)}
                editable={!loading}
                icon="lock-closed-outline"
              />

              <InputField
                label="Confirm Password"
                value={form.confirmPassword}
                onChangeText={(v) => set('confirmPassword', v)}
                placeholder="Re-enter password"
                error={errors.confirmPassword}
                secure
                showPass={showPass}
                editable={!loading}
                icon="lock-closed-outline"
              />

              {form.password.length > 0 && (
                <View style={styles.strengthSection}>
                  <View style={styles.strengthBar}>
                    {[0, 1, 2, 3].map((i) => (
                      <View
                        key={i}
                        style={[
                          styles.strengthSegment,
                          {
                            backgroundColor: i < passwordStrength
                              ? strengthColors[passwordStrength]
                              : GLASS.bgMedium,
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.strengthLabel, { color: strengthColors[passwordStrength] }]}>
                    {strengthLabels[passwordStrength]}
                  </Text>
                </View>
              )}

              <View style={styles.hintBox}>
                <Text style={styles.hintTitle}>Password must contain:</Text>
                <View style={styles.hintItem}>
                  <Ionicons
                    name={form.password.length >= 8 ? 'checkmark-circle' : 'ellipse-outline'}
                    size={14}
                    color={form.password.length >= 8 ? COLORS.success : COLORS.textMuted}
                  />
                  <Text style={[styles.hintText, form.password.length >= 8 && styles.hintValid]}>
                    At least 8 characters
                  </Text>
                </View>
                <View style={styles.hintItem}>
                  <Ionicons
                    name={/[A-Z]/.test(form.password) ? 'checkmark-circle' : 'ellipse-outline'}
                    size={14}
                    color={/[A-Z]/.test(form.password) ? COLORS.success : COLORS.textMuted}
                  />
                  <Text style={[styles.hintText, /[A-Z]/.test(form.password) && styles.hintValid]}>
                    One uppercase letter
                  </Text>
                </View>
                <View style={styles.hintItem}>
                  <Ionicons
                    name={/\d/.test(form.password) ? 'checkmark-circle' : 'ellipse-outline'}
                    size={14}
                    color={/\d/.test(form.password) ? COLORS.success : COLORS.textMuted}
                  />
                  <Text style={[styles.hintText, /\d/.test(form.password) && styles.hintValid]}>
                    One number
                  </Text>
                </View>
              </View>

              <Button
                title={loading ? 'Creating Account...' : 'Create Driver Account'}
                onPress={handleRegister}
                loading={loading}
                disabled={loading}
                variant="accent"
                style={styles.registerBtn}
              />

              <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkRow}>
                <Text style={styles.linkText}>Already have an account? </Text>
                <Text style={styles.link}>Sign In →</Text>
              </TouchableOpacity>
              </GlassView>
            </Animated.View>

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
    ...SHADOWS.glow,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: { fontSize: TYPOGRAPHY.sizes.md, color: COLORS.textSecondary, textAlign: 'center' },

  card: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: GLASS.borderSubtle,
    overflow: 'hidden',
  },
  cardGlass: {
    padding: SPACING.xl,
    gap: SPACING.md,
  },

  fieldGroup: { gap: SPACING.xs },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: GLASS.inputBgFocus,
  },
  inputError: { borderColor: COLORS.danger },
  inputIcon: { marginRight: SPACING.sm },
  passwordInput: {
    flex: 1,
    paddingVertical: SPACING.sm + 4,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.md,
    ...(isWeb ? { outlineStyle: 'none' } : {}),
  },
  eyeBtn:  { padding: SPACING.xs },
  errorText:  { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.danger },

  strengthSection: {
    gap: SPACING.xs,
  },
  strengthBar: {
    flexDirection: 'row',
    gap: 4,
  },
  strengthSegment: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
  },
  strengthLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  hintBox: {
    backgroundColor: GLASS.bgLight,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm + 4,
    gap: 6,
    borderWidth: 1,
    borderColor: GLASS.borderSubtle,
  },
  hintTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: 2,
  },
  hintItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  hintText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textMuted,
  },
  hintValid: {
    color: COLORS.success,
  },

  registerBtn: { marginTop: SPACING.sm },

  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xs },
  linkText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.textSecondary },
  link:     { color: COLORS.primaryLight, fontWeight: TYPOGRAPHY.weights.semibold, fontSize: TYPOGRAPHY.sizes.sm },

  footerText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: SPACING.xl,
  },
});

export default RegisterScreen;
