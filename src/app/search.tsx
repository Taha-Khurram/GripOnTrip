import { Stack } from 'expo-router';

import { ComingSoon } from '@/components/layout/ComingSoon';

export default function SearchScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Search' }} />
      <ComingSoon
        title="Search"
        icon="search-outline"
        note="Add a unified search across hotels, rentals, tours and guides."
      />
    </>
  );
}
