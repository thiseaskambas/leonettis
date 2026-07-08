const LOCAL_SITE_URL = 'http://localhost:3000';

interface SiteUrlOptions {
  rawSiteUrl?: string;
  nodeEnv?: string;
}

export function getSiteUrl({
  rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL,
  nodeEnv = process.env.NODE_ENV,
}: SiteUrlOptions = {}): string {
  const trimmed = rawSiteUrl?.trim();

  if (!trimmed) {
    if (nodeEnv === 'production') {
      throw new Error('NEXT_PUBLIC_SITE_URL is not configured');
    }

    return LOCAL_SITE_URL;
  }

  const withoutTrailingSlashes = trimmed.replace(/\/+$/, '');

  let parsed: URL;
  try {
    parsed = new URL(withoutTrailingSlashes);
  } catch {
    throw new Error('NEXT_PUBLIC_SITE_URL must be an absolute http(s) URL');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('NEXT_PUBLIC_SITE_URL must be an absolute http(s) URL');
  }

  if (parsed.pathname !== '/' || parsed.search || parsed.hash) {
    throw new Error(
      'NEXT_PUBLIC_SITE_URL must be an origin without path, query, or hash'
    );
  }

  return parsed.origin;
}
