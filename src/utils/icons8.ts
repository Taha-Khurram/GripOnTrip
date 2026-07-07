/**
 * icons8 3D icon URLs — the exact colorful icon set gripontrip.com uses across
 * its category tiles and section headers. Rendered via `expo-image` (cached).
 */
export function icons8(name: string, style: '3d-fluency' | 'color' = '3d-fluency', size = 94): string {
  return `https://img.icons8.com/${style}/${size}/${name}.png`;
}

/** Category → icons8 icon name, mirroring the website's tiles. */
export const CATEGORY_ICON: Record<string, { name: string; style: '3d-fluency' | 'color' }> = {
  hotels: { name: 'real-estate', style: '3d-fluency' },
  rentals: { name: 'home', style: '3d-fluency' },
  tours: { name: 'briefcase', style: '3d-fluency' },
  umrah: { name: 'kaaba', style: 'color' },
  guides: { name: 'compass', style: '3d-fluency' },
  shop: { name: 'shopping-bag', style: '3d-fluency' },
};
