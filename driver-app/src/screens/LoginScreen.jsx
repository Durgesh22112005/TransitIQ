import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, GLASS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, ANIMATION } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import GlassView from '../components/GlassView';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const FORM_MAX_WIDTH = 420;

const InputField = ({ label, value, onChangeText, placeholder, error, secure, keyboardType, showPass, onTogglePass, editable, icon }) => {
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: focused ? 1 : error ? 2 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focused, error]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [COLORS.border, COLORS.primary, COLORS.danger],
  });

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <GlassView intensity={15} tint="dark" style={[styles.inputWrapper, { borderColor }, focused && styles.inputWrapperFocused]}>
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={focused ? COLORS.primary : COLORS.textMuted}
            style={styles.inputIcon}
          />
        )}
        <TextInput
          style={[styles.input, icon && styles.inputWithIcon]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure && !showPass}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secure && (
          <TouchableOpacity onPress={onTogglePass} style={styles.eyeBtn}>
            <Ionicons
              name={showPass ? 'eye-off' : 'eye'}
              size={20}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>
        )}
      </GlassView>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
};

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

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.logoSection}>
              <LinearGradient
                colors={GRADIENTS.primary}
                style={styles.logoBox}
              >
                <Ionicons name="bus" size={32} color={COLORS.textWhite} />
              </LinearGradient>
              <Text style={styles.brandName}>TransitIQ</Text>
              <Text style={styles.brandTagline}>Driver Portal</Text>
            </View>

            <Animated.View style={[styles.card, { opacity: cardFade, transform: [{ translateY: cardSlide }] }]}>
              <GlassView intensity={25} tint="dark" style={styles.cardGlass}>
                <Text style={styles.cardTitle}>Welcome Back</Text>
                <Text style={styles.cardSubtitle}>Sign in to start your shift</Text>

                {loginError ? (
                  <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle" size={18} color={COLORS.danger} />
                    <Text style={styles.errorBannerText}>{loginError}</Text>
                  </View>
                ) : null}

              <InputField
                label="Email Address"
                value={email}
                onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: '' })); setLoginError(''); }}
                placeholder="driver@transitiq.com"
                error={errors.email}
                keyboardType="email-address"
                editable={!loading}
                icon="mail-outline"
              />

              <InputField
                label="Password"
                value={password}
                onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: '' })); setLoginError(''); }}
                placeholder="Enter your password"
                error={errors.password}
                secure
                showPass={showPass}
                onTogglePass={() => setShowPass((v) => !v)}
                editable={!loading}
                icon="lock-closed-outline"
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
              </GlassView>
            </Animated.View>

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
    ...SHADOWS.glow,
  },
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
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: GLASS.borderSubtle,
    overflow: 'hidden',
  },
  cardGlass: {
    padding: SPACING.lg,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerBg,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm + 4,
    borderWidth: 1,
    borderColor: COLORS.danger + '30',
    gap: SPACING.sm,
  },
  errorBannerText: {
    flex: 1,
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
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  inputWrapperFocused: {
    backgroundColor: GLASS.inputBgFocus,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.sm + 6,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  inputWithIcon: {},
  eyeBtn: { padding: SPACING.xs },
  fieldError: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.danger,
    fontWeight: TYPOGRAPHY.weights.medium,
  },

  loginBtn: { marginTop: SPACING.sm },

  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xs },
  linkText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.textSecondary },
  linkHighlight: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.primaryLight, fontWeight: TYPOGRAPHY.weights.semibold },

  version: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textMuted,
  },
});

export default LoginScreen;
