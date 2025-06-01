/** @type {import('next').NextConfig} */
const nextConfig: import('next').NextConfig = {
 
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'npisoaxbzbcvxfomvlnx.supabase.co', 
        port: '', 
        pathname: '/storage/v1/object/public/**', 
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