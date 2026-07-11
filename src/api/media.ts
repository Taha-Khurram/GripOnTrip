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

/**
 * Request headers for loading remote images with `expo-image`.
 *
 * Some operator logos are hosted on Instagram's CDN (`scontent.cdninstagram.com`),
 * which returns 403 to requests that don't look like a browser — the native image
 * loader's default User-Agent is blocked, so the image renders on the website but
 * not in the app. Sending a browser UA (+ referer) makes the on-device request
 * pass the CDN's hotlink check. Harmless for Supabase/site-hosted images.
 */
export const IMAGE_REQUEST_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  Referer: 'https://www.instagram.com/',
} as const;
