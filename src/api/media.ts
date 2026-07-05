import { env } from '@/config/env';

/**
 * Resolve an image path from the API to an absolute URL.
 *
 * List endpoints return absolute Supabase URLs, while detail endpoints return
 * site-relative proxy paths (e.g. `/api/image-proxy?...`). Relative paths are
 * joined onto the public site origin so `expo-image` can load them.
 */
export function resolveImageUrl(url: string): string {
  if (/^https?:\/\//.test(url)) return url;
  const origin = env.webUrl.replace(/\/$/, '');
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
}
