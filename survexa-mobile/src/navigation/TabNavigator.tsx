import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet, View } from 'react-native';
import Dashboard from '../screens/Dashboard';
import AnalyticsDashboard from '../screens/AnalyticsDashboard';
import Profile from '../screens/Profile';
import { brandColors } from '../theme/colors';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, focused }) => {
          let icon = '';
          if (route.name === 'DashboardTab') {
            icon = '📊';
          } else if (route.name === 'AnalyticsTab') {
            icon = '📈';
          } else if (route.name === 'ProfileTab') {
            icon = '👤';
          }
          return (
            <View style={styles.iconContainer}>
              <Text style={[styles.iconText, { opacity: focused ? 1 : 0.6 }]}>{icon}</Text>
            </View>
          );
        },
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: styles.tabBar,
        tabBarLabel: ({ focused, children }) => {
          let label = children;
          if (children === 'DashboardTab') label = 'Dashboard';
          if (children === 'AnalyticsTab') label = 'Analytics';
          if (children === 'ProfileTab') label = 'Profile';
          return (
            <Text style={[styles.tabLabel, { color: focused ? '#8B5CF6' : '#64748B', fontWeight: focused ? '700' : '500' }]}>
              {label}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen 
        name="DashboardTab" 
        component={Dashboard} 
        options={{ title: 'Dashboard' }} 
      />
      <Tab.Screen 
        name="AnalyticsTab" 
        component={AnalyticsDashboard} 
        options={{ title: 'Analytics' }} 
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={Profile} 
        options={{ title: 'Profile' }} 
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
  },
});
