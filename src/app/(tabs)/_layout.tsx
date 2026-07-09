import { Ionicons } from '@expo/vector-icons';
import { Link, Tabs } from 'expo-router';
import { Pressable, View } from 'react-native';

const TINT = '#1a7a8c';

function ProfileButton() {
  return (
    <Link href="/profile" asChild>
      <Pressable accessibilityLabel="Profile" hitSlop={8} style={{ marginRight: 16 }}>
        <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-50 border border-hairline">
          <Ionicons name="person-outline" size={18} color={TINT} />
        </View>
      </Pressable>
    </Link>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: TINT,
        tabBarInactiveTintColor: '#9aa7ac',
        headerShown: true,
        headerStyle: { backgroundColor: '#f5efe4' },
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: '#0c2b36' },
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e6dcc8',
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
