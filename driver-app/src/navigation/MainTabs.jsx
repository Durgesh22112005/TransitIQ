import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';

import DriverDashboard from '../screens/DriverDashboard';
import LiveTracking from '../screens/LiveTracking';
import TripHistory from '../screens/TripHistory';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({ icon, focused }) => (
  <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{icon}</Text>
);

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
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DriverDashboard}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="LiveTracking"
        component={LiveTracking}
        options={{
          tabBarLabel: 'Live Track',
          tabBarIcon: ({ focused }) => <TabIcon icon="📍" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="TripHistory"
        component={TripHistory}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ focused }) => <TabIcon icon="📋" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.sm,
    height: 64,
    ...SHADOWS.elevated,
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  tabItem: {
    paddingVertical: SPACING.xs,
  },
  tabIcon: {
    fontSize: 22,
    opacity: 0.5,
  },
  tabIconActive: {
    opacity: 1,
  },
});

export default MainTabs;
