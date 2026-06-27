import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'bgdcwnvsnbwbmlsoaipv.supabase.co',
      },
      {
        // allow any https image host — cover images may come from external URLs
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig
