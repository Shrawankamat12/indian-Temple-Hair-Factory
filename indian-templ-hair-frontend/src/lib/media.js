import { resolveImageUrl } from './api';

// Sample banners created by the backend seed point at /uploads/seed-placeholder.svg because the
// Banner model requires an image. Treat that (and empty values) as "no image uploaded" so the
// storefront can fall back to its bundled photo or a neutral tile.
const PLACEHOLDER = /seed-placeholder/i;

export const isRealImage = (src) => Boolean(src) && !PLACEHOLDER.test(src);

/** Admin-uploaded image (resolved to a full URL) or the given fallback (a bundled photo or null). */
export const imageOr = (src, fallback = null) => (isRealImage(src) ? resolveImageUrl(src) : fallback);

/** Internal link (/shop) vs external URL, for banner CTAs. */
export const isExternal = (url = '') => /^https?:\/\//i.test(url);
