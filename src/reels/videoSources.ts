/**
 * Helpers for the clip URLs.
 *
 * The reel draws its clips straight onto the canvas and the export captures
 * that canvas, so a clip has to be a media file the browser is allowed to
 * read. A YouTube (or TikTok, or X) page link is neither.
 */

const PAGE_HOSTS = [
  'youtube.com',
  'youtu.be',
  'vimeo.com',
  'dailymotion.com',
  'tiktok.com',
  'instagram.com',
  'facebook.com',
  'fb.watch',
  'twitter.com',
  'x.com',
  'twitch.tv',
  'streamable.com',
];

/** True when the URL points at a page rather than a media file. */
export const isPageUrl = (url: string): boolean => {
  const clean = url.trim().toLowerCase();
  if (!clean) return false;
  if (clean.startsWith('blob:') || clean.startsWith('data:')) return false;
  try {
    const host = new URL(clean).hostname.replace(/^www\./, '');
    return PAGE_HOSTS.some((known) => host === known || host.endsWith('.' + known));
  } catch {
    return false;
  }
};

/** True when the URL looks like a direct media file. */
export const looksLikeMedia = (url: string): boolean => {
  const clean = url.trim().split('?')[0].toLowerCase();
  if (!clean) return false;
  if (clean.startsWith('blob:') || clean.startsWith('data:')) return true;
  return /\.(mp4|webm|mov|m4v|ogv|ogg|mp3)$/.test(clean);
};

/** A local file picked from disk. */
export const isLocalFile = (url: string): boolean => url.startsWith('blob:');
