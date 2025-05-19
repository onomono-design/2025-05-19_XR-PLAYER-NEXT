/** @type {import('next').NextConfig} */
const nextConfig = {
  // ESLint and TypeScript checks enabled for better code quality
  // Comment out these sections if you need to temporarily disable them
  /*
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  */
  images: {
    unoptimized: true,
  },
}

export default nextConfig
