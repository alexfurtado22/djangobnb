import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typedRoutes: true, // Now stable!

  // Add images configuration here
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
    ],
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    })
    return config
  },

  /**
   * This rule is for TURBOPACK.
   * This is the new, stable configuration path for `next.dev --turbo`.
   */
  turbopack: {
    rules: {
      '**/*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.tsx',
      },
    },
  },
}

export default nextConfig
