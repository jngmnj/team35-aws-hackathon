import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // S3 정적 웹사이트 호환성을 위한 설정
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : ''
};

export default nextConfig;
