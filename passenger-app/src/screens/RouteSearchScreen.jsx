// =============================================================
// src/screens/RouteSearchScreen.jsx – Passenger App
// =============================================================

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import SearchBar from '../components/SearchBar';
import RouteResultCard from '../components/RouteResultCard';
import BusChip from '../components/BusChip';
import { routeAPI } from '../services/api.service';

const STATUS_FILTERS = ['ALL', 'ACTIVE', 'INACTIVE'];

// Debounce utility
const debounce = (fn, delay) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
};

const RouteSearchScreen = ({ navigation, route: navRoute }) => {
  const [query,   setQuery]   = useState(navRoute?.params?.query || '');
  const [routes,  setRoutes]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter,  setFilter]  = useState('ALL');
  const [searched, setSearched] = useState(false);

  const fetchRoutes = async (q, f) => {
    setLoading(true);
    setSearched(true);
    try {
      const params = { limit: 20 };
      if (q.trim()) params.search = q.trim();
      if (f !== 'ALL') params.status = f;
      const res = await routeAPI.getAll(params);
      setRoutes(res.data?.routes || []);
    } catch (err) {
      Alert.alert('Error', err.message);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetch = useCallback(debounce(fetchRoutes, 400), []);

  const handleQueryChange = (text) => {
    setQuery(text);
    debouncedFetch(text, filter);
  };

  const handleFilterChange = (f) => {
    setFilter(f);
    fetchRoutes(query, f);
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{searched ? '🔍' : '🚏'}</Text>
      <Text style={styles.emptyTitle}>
        {searched ? 'No routes found' : 'Search for a route'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searched
          ? 'Try a different keyword or filter'
          : 'Enter a destination, route name, or route number'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primaryDark, '#1A0A3E']}
        style={styles.header}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Routes</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={query}
          onChangeText={handleQueryChange}
          placeholder="Search by route name or number..."
          autoFocus
        />
      </View>

      {/* Filter chips */}
      <View style={styles.filtersRow}>
        {STATUS_FILTERS.map((f) => (
          <BusChip
            key={f}
            label={f}
            active={filter === f}
            onPress={() => handleFilterChange(f)}
          />
        ))}
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Searching routes...</Text>
        </View>
      ) : (
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RouteResultCard
              route={item}
              onPress={() => Alert.alert('Route Details', `Route ${item.routeNo}: ${item.name}\nPhase 2 will show full details & bus tracking.`)}
            />
          )}
          ListEmptyComponent={<EmptyState />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    paddingTop: 56, paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row', alignItems: 'center',
  },
  backBtn:     { padding: SPACING.xs },
  backArrow:   { fontSize: 24, color: COLORS.textPrimary },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.textPrimary },

  searchContainer: { padding: SPACING.md, paddingBottom: 0 },

  filtersRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },

  loaderBox:   { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.md },
  loadingText: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.md },

  listContent: { padding: SPACING.md, gap: SPACING.sm, paddingBottom: SPACING['3xl'] },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: SPACING['3xl'], gap: SPACING.md },
  emptyIcon:  { fontSize: 56 },
  emptyTitle: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.textPrimary, textAlign: 'center' },
  emptySubtitle: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: SPACING.xl },
});

export default RouteSearchScreen;
