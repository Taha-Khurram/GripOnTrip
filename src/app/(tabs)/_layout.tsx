import { Ionicons } from '@expo/vector-icons';
import { Link, Tabs } from 'expo-router';
import { Pressable, View } from 'react-native';

// Gold = active/accent (brand spec); navy = primary UI ink.
const ACTIVE_TINT = '#f5a623';
const NAVY = '#1e3a5f';

function ProfileButton() {
  return (
    <Link href="/profile" asChild>
      <Pressable accessibilityLabel="Profile" hitSlop={8} style={{ marginRight: 16 }}>
        <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-50 border border-hairline">
          <Ionicons name="person-outline" size={18} color={NAVY} />
        </View>
      </Pressable>
    </Link>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ACTIVE_TINT,
        tabBarInactiveTintColor: '#9aa7ac',
        headerShown: true,
        headerStyle: { backgroundColor: '#eef2f7' },
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: '#0a1a2f' },
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#dbe3ec',
          height: 62,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontFamily: 'Figtree_500Medium', fontSize: 11 },
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
          title: 'BNB',
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
