import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../../'),
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    typedRoutes: false,
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
  async rewrites() {
    const backendUrl =
      process.env.INTERNAL_API_URL ||
      process.env.API_URL ||
      process.env.BACKEND_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'http://api.railway.internal:3001'
        : 'http://localhost:3001');

    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
