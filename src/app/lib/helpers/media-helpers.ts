/**
 * Returns the full URL for a media path. Uses NEXT_PUBLIC_MEDIA_BASE_URL
 * when set (e.g. CloudFront); otherwise returns the path as-is (e.g. local /public).
 */
export function getMediaUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  console.log('base', base);
  if (!base) return path;
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  console.log('normalized', normalized);
  const result = `${base.replace(/\/$/, '')}/${normalized}`;
  console.log('result', result);
  return result;
}
