/**
 * Static app configuration: brand info and the marketplace verticals that drive
 * navigation and the home screen. Mirrors the Grip On Trip website sections.
 */
import type { ServiceCategory } from '@/types';

export const APP_NAME = 'Grip On Trip';
export const APP_TAGLINE = 'Direct prices. Zero commission.';
export const SUPPORT_EMAIL = 'support@gripontrip.com';

export interface CategoryMeta {
  key: ServiceCategory;
  label: string;
  /** Ionicons name used across cards and the tab bar. */
  icon: string;
  description: string;
  route: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    key: 'hotels',
    label: 'Hotels & Stays',
    icon: 'bed-outline',
    description: 'Luxury accommodations with direct owner access.',
    route: '/hotels',
  },
  {
    key: 'rentals',
    label: 'Vacation Rentals',
    icon: 'home-outline',
    description: 'Villas, apartments and unique properties.',
    route: '/(tabs)/rentals',
  },
  {
    key: 'tours',
    label: 'Guided Tours',
    icon: 'map-outline',
    description: 'Expert-curated travel experiences.',
    route: '/(tabs)/tours',
  },
  {
    key: 'umrah',
    label: 'Umrah Packages',
    icon: 'moon-outline',
    description: 'Shariah-compliant retreats with visa & hotel services.',
    route: '/(tabs)/umrah',
  },
  {
    key: 'guides',
    label: 'Verified Guides',
    icon: 'people-outline',
    description: 'Local experts for cultural & hiking experiences.',
    route: '/(tabs)/guides',
  },
  {
    key: 'shop',
    label: 'Marketplace',
    icon: 'bag-handle-outline',
    description: 'Travel gear and local products.',
    route: '/(tabs)/shop',
  },
];
