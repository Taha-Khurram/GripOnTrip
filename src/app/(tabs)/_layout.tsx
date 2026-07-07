import { Ionicons } from '@expo/vector-icons';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

const TINT = '#219ebc';

function ProfileButton() {
  return (
    <Link href="/profile" asChild>
      <Pressable accessibilityLabel="Profile" hitSlop={8} style={{ marginRight: 16 }}>
        <Ionicons name="person-circle-outline" size={26} color={TINT} />
      </Pressable>
    </Link>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: TINT,
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: true,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="map-outline" color={color} size={size} />,
          headerRight: () => <ProfileButton />,
        }}
      />
      <Tabs.Screen
        name="tours"
        options={{
          title: 'Tours',
          tabBarIcon: ({ color, size }) => <Ionicons name="bus-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="rentals"
        options={{
          title: 'Rentals',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="umrah"
        options={{
          title: 'Umrah',
          tabBarIcon: ({ color, size }) => <Ionicons name="moon-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, size }) => <Ionicons name="bag-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="guides"
        options={{
          title: 'Guides',
          tabBarIcon: ({ color, size }) => <Ionicons name="compass-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
