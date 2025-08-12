// Micro Adventure Route Planner Tab Layout - 3 Tabs Only
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Text } from 'react-native';

// Cross-platform icon component
const TabIcon = ({ icon, color }: { icon: string; color: string }) => {
  if (Platform.OS === 'web') {
    return <span style={{ fontSize: 20, color }}>{icon}</span>;
  }
  return (
    <Text style={{ fontSize: 20, color }}>
      {icon}
    </Text>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#333333',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ 
          title: 'Route Planner',
          tabBarIcon: ({ color }) => <TabIcon icon="🗺️" color={color} />
        }}
      />
      <Tabs.Screen
        name="history"
        options={{ 
          title: 'History',
          tabBarIcon: ({ color }) => <TabIcon icon="📚" color={color} />
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{ 
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabIcon icon="⚙️" color={color} />
        }}
      />
    </Tabs>
  );
}
