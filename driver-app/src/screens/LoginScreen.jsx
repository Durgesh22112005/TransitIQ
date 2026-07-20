import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, Animated, Alert, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const FORM_MAX_WIDTH = 420;

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email address.';
    if (!password.trim()) errs.password = 'Password is required.';
    if (password.length > 0 && password.length < 6) errs.password = 'Invalid password.';
    setErrors(errs);
    setLoginError('');
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setLoginError('');
    try {
      const user = await login(email.trim().toLowerCase(), password);
      if (user.role !== 'DRIVER') {
        setLoginError('This account is not registered as a driver.');
        return;
      }
      navigation.replace('MainTabs');
    } catch (err) {
      setLoginError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, value, onChange, placeholder, error, secure, keyboardType }) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          value={value}
          onChangeText={(t) => { onChange(t); setErrors((e) => ({ ...e, [label.toLowerCase()]: '' })); setLoginError(''); }}
          secureTextEntry={secure && !showPass}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />
        {secure && (
          <TouchableOpacity onPress={() => setShowPass((v) => !v)} style={styles.eyeBtn}>
            <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );

  return (
    <LinearGradient colors={[COLORS.background, COLORS.primaryBg]} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.logoSection}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.logoBox}
              >
                <Text style={styles.logoEmoji}>🚌</Text>
              </LinearGradient>
              <Text style={styles.brandName}>TransitIQ</Text>
              <Text style={styles.brandTagline}>Driver Portal</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Welcome Back</Text>
              <Text style={styles.cardSubtitle}>Sign in to start your shift</Text>

              {loginError ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{loginError}</Text>
                </View>
              ) : null}

              <InputField
                label="Email Address"
                value={email}
                onChange={setEmail}
                placeholder="driver@transitiq.com"
                error={errors.email}
                keyboardType="email-address"
              />

              <InputField
                label="Password"
                value={password}
                onChange={setPassword}
                placeholder="Enter your password"
                error={errors.password}
                secure
              />

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.loginBtn}
              />

              <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkRow}>
                <Text style={styles.linkText}>Don't have an account? </Text>
                <Text style={styles.linkHighlight}>Create Account</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.version}>TransitIQ v1.0.0</Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: SPACING.lg },
  content: {
    width: '100%',
    maxWidth: isWeb ? FORM_MAX_WIDTH : undefined,
    alignSelf: 'center',
    gap: SPACING.lg,
  },

  logoSection: { alignItems: 'center', marginBottom: SPACING.sm },
  logoBox: {
    width: 72, height: 72, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  logoEmoji: { fontSize: 34 },
  brandName: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  brandTagline: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
    gap: SPACING.md,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  cardSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: -SPACING.sm,
  },

  errorBanner: {
    backgroundColor: COLORS.dangerBg,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm + 4,
    borderWidth: 1,
    borderColor: COLORS.danger + '30',
  },
  errorBannerText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.danger,
    fontWeight: TYPOGRAPHY.weights.medium,
  },

  fieldGroup: { gap: SPACING.xs },
  fieldLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  inputError: { borderColor: COLORS.danger + '60' },
  input: {
    flex: 1,
    paddingVertical: SPACING.sm + 6,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  eyeBtn: { padding: SPACING.xs },
  eyeIcon: { fontSize: 18 },
  fieldError: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.danger,
    fontWeight: TYPOGRAPHY.weights.medium,
  },

  loginBtn: { marginTop: SPACING.sm },

  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xs },
  linkText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.textSecondary },
  linkHighlight: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.primary, fontWeight: TYPOGRAPHY.weights.semibold },

  version: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textMuted,
  },
});

export default LoginScreen;
