import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/Jungcar',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
