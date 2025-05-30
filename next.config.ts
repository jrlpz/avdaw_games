/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/avatars/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb', 
    },
  },
};

module.exports = nextConfig;