import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GLASS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, ANIMATION } from '../constants/theme';
import GlassView from '../components/GlassView';

import DriverDashboard from '../screens/DriverDashboard';
import LiveTracking from '../screens/LiveTracking';
import TripHistory from '../screens/TripHistory';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Dashboard:    { focused: 'home',            unfocused: 'home-outline' },
  LiveTracking: { focused: 'location-sharp', unfocused: 'location-outline' },
  TripHistory:  { focused: 'time',            unfocused: 'time-outline' },
  Profile:      { focused: 'person',          unfocused: 'person-outline' },
};

const TabIcon = ({ route, focused }) => {
  const routeName = route?.name || 'Dashboard';
  const icons = TAB_ICONS[routeName] || TAB_ICONS.Dashboard;
  const iconName = focused ? icons.focused : icons.unfocused;

  const scale = useRef(new Animated.Value(focused ? 1 : 0.9)).current;
  const opacity = useRef(new Animated.Value(focused ? 1 : 0.5)).current;
  const bgOpacity = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1 : 0.9,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: focused ? 1 : 0.5,
        duration: ANIMATION.tabTransition,
        useNativeDriver: true,
      }),
      Animated.timing(bgOpacity, {
        toValue: focused ? 1 : 0,
        duration: ANIMATION.tabTransition,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  return (
    <Animated.View style={[styles.iconContainer, { opacity, transform: [{ scale }] }]}>
      <Animated.View
        style={[
          styles.activeIndicator,
          {
            opacity: bgOpacity,
            transform: [{ scale: bgOpacity }],
          },
        ]}
      />
      <Ionicons
        name={iconName}
        size={22}
        color={focused ? COLORS.tabActive : COLORS.tabInactive}
      />
    </Animated.View>
  );
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.tabActive,
        tabBarInactiveTintColor: COLORS.tabInactive,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        tabBarHideOnKeyboard: true,
        tabBarBackground: () => (
          <GlassView intensity={60} tint="dark" style={styles.tabBarGlass}>
            <View style={styles.tabBarHighlight} />
          </GlassView>
        ),
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DriverDashboard}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ focused, route }) => <TabIcon route={route} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="LiveTracking"
        component={LiveTracking}
        options={{
          tabBarLabel: 'Live Track',
          tabBarIcon: ({ focused, route }) => <TabIcon route={route} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="TripHistory"
        component={TripHistory}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ focused, route }) => <TabIcon route={route} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, route }) => <TabIcon route={route} focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.sm + 4,
    height: 68,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarGlass: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.10)',
  },
  tabBarHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginTop: 2,
  },
  tabItem: {
    paddingVertical: SPACING.xs,
    gap: 2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 32,
  },
  activeIndicator: {
    position: 'absolute',
    top: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.tabActive + '18',
  },
});

export default MainTabs;
