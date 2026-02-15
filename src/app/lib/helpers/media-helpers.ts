/**
 * Returns the full URL for a media path. Uses NEXT_PUBLIC_MEDIA_BASE_URL
 * when set (e.g. CloudFront); otherwise returns the path as-is (e.g. local /public).
 */
export function getMediaUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  if (!base) return path;
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  const result = `${base.replace(/\/$/, '')}/${normalized}`;
  return result;
}

export function getMediaBlurDataURL(path: string): string {
  const base = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  if (!base) return path;

  // Remove leading slash to avoid double slashes later
  const normalized = path.startsWith('/') ? path.slice(1) : path;

  const lastSlashIndex = normalized.lastIndexOf('/');
  let iconPath;

  if (lastSlashIndex === -1) {
    // If there's no slash, the whole string is the filename
    iconPath = `ico-${normalized}`;
  } else {
    // Standard logic for paths with directories
    iconPath =
      normalized.substring(0, lastSlashIndex + 1) + // Includes the slash
      'ico-' +
      normalized.substring(lastSlashIndex + 1);
  }

  // Ensure base doesn't have a trailing slash and join
  const result = `${base.replace(/\/$/, '')}/${iconPath}`;

  return result;
}
