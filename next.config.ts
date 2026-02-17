import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Cloudflare Pages 配置
  experimental: {
    // 启用服务端 Actions 支持
    serverActions: {
      allowedOrigins: ['*.pages.dev', '*.cloudflare.pages.dev', '*.pages.cloudflare.com'],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lf-coze-web-cdn.coze.cn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/**',
      },
    ],
    // Cloudflare Pages 图片优化配置
    unoptimized: true,
  },
  // 允许的开发源
  allowedDevOrigins: ['*.dev.coze.site', 'localhost'],
};

export default nextConfig;
