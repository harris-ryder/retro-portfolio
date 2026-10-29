import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    // Turbopack's on-disk dev cache (on by default since Next 16) kept
    // serving a stale globals.css after edits, branch switches and builds,
    // so the browser showed layouts the file no longer described. The cold
    // start it saves is a couple of seconds on a site this size.
    turbopackFileSystemCacheForDev: false,
  },
  // Vercel serves public/ files with max-age=0, so every image and clip is
  // revalidated on each visit. They change rarely (and usually under a new
  // name), so browsers may keep them for a day and the CDN for a week,
  // refreshing in the background after that.
  async headers() {
    return [
      {
        source: '/:dir(images|videos)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800',
          },
        ],
      },
    ]
  },
}

export default nextConfig
