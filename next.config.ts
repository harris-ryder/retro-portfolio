import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    // Turbopack's on-disk dev cache (on by default since Next 16) kept
    // serving a stale globals.css after edits, branch switches and builds,
    // so the browser showed layouts the file no longer described. The cold
    // start it saves is a couple of seconds on a site this size.
    turbopackFileSystemCacheForDev: false,
  },
}

export default nextConfig
