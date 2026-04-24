import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const sevallaPublicUrl = process.env.SEVALLA_PUBLIC_URL;
const sevallaHostname = sevallaPublicUrl
  ? new URL(sevallaPublicUrl).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'blogfeed-ar0uj.sevalla.storage',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'leonettis-lwqcz.sevalla.storage',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      ...(sevallaHostname
        ? [
            {
              protocol: 'https' as const,
              hostname: sevallaHostname,
              pathname: '/**',
            },
          ]
        : []),
    ],
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
