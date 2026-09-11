export const DEFAULT_ARTICLE_IMAGE =
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';

export const DEFAULT_AVATAR_IMAGE =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80';

export const DEFAULT_TOOL_IMAGE =
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=240&q=80';

/**
 * Returns a valid, non-empty image URL.
 * Prevents passing an empty string ("") to DOM <img> elements which causes
 * browsers to re-request the current page and React to trigger console warnings.
 */
export function getSafeImage(src?: string | null, fallback: string = DEFAULT_ARTICLE_IMAGE): string {
  if (!src || typeof src !== 'string' || !src.trim()) {
    return fallback;
  }
  return src.trim();
}

export function getSafeAvatar(src?: string | null): string {
  return getSafeImage(src, DEFAULT_AVATAR_IMAGE);
}

export function getSafeToolLogo(src?: string | null): string {
  return getSafeImage(src, DEFAULT_TOOL_IMAGE);
}
