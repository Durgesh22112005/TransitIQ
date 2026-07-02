// =============================================================
// src/components/SearchBar.jsx – Passenger App
// =============================================================

import React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';

/**
 * SearchBar – styled search input
 */
const SearchBar = ({ value, onChangeText, placeholder, autoFocus, editable = true, pointerEvents }) => (
  <View style={styles.container} pointerEvents={pointerEvents}>
    <Text style={styles.icon}>🔍</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder || 'Search...'}
      placeholderTextColor={COLORS.textMuted}
      autoFocus={autoFocus}
      editable={editable}
      autoCapitalize="none"
      autoCorrect={false}
      returnKeyType="search"
    />
    {value?.length > 0 && (
      <Text style={styles.clearIcon} onPress={() => onChangeText('')}>✕</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  icon:      { fontSize: 16 },
  input:     { flex: 1, color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.md },
  clearIcon: { fontSize: 14, color: COLORS.textMuted, padding: SPACING.xs },
});

export default SearchBar;
