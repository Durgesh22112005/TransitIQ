// =============================================================
// src/navigation/AppNavigator.jsx – Passenger App
// =============================================================

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';

// Screens
import SplashScreen      from '../screens/SplashScreen';
import LoginScreen       from '../screens/LoginScreen';
import RegisterScreen    from '../screens/RegisterScreen';
import HomeScreen        from '../screens/HomeScreen';
import RouteSearchScreen from '../screens/RouteSearchScreen';

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
        <Stack.Screen name="Splash"       component={SplashScreen} />
        <Stack.Screen name="Login"        component={LoginScreen} />
        <Stack.Screen name="Register"     component={RegisterScreen} />
        <Stack.Screen name="Home"         component={HomeScreen} />
        <Stack.Screen name="RouteSearch"  component={RouteSearchScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
});

export default AppNavigator;
