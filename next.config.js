/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' for development to enable API routes
  // Add it back when building for static deployment
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig 