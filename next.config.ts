import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // basePath 제거됨 - jungcar.com 도메인 사용
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
