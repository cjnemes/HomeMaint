/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Enable SWC minification for faster builds
  swcMinify: true,

  // Output standalone for easier deployment
  output: 'standalone',

  // Disable telemetry for privacy
  eslint: {
    // Run ESLint on these directories during production builds
    dirs: ['app', 'components', 'lib', 'types'],
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Experimental features
  experimental: {
    // Enable Server Actions
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

module.exports = nextConfig;
