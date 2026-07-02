// =============================================================
// src/navigation/AppNavigator.jsx – Driver App
// =============================================================

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

// Screens
import SplashScreen       from '../screens/SplashScreen';
import LoginScreen        from '../screens/LoginScreen';
import RegisterScreen     from '../screens/RegisterScreen';
import DashboardScreen    from '../screens/DashboardScreen';
import AssignedRouteScreen from '../screens/AssignedRouteScreen';
import ProfileScreen      from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="Splash"         component={SplashScreen} />
        <Stack.Screen name="Login"          component={LoginScreen} />
        <Stack.Screen name="Register"       component={RegisterScreen} />
        <Stack.Screen name="Dashboard"      component={DashboardScreen} />
        <Stack.Screen name="AssignedRoute"  component={AssignedRouteScreen} />
        <Stack.Screen name="Profile"        component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
});

export default AppNavigator;
