// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better streaming
  experimental: {
    serverComponentsExternalPackages: ['jsonwebtoken']
  }
};

module.exports = nextConfig;