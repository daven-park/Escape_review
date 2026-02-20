import type { NextConfig } from 'next';

const fallbackApiUrl = 'http://localhost:3000/api/v1';
const apiUrl = process.env.NEXT_PUBLIC_API_URL || fallbackApiUrl;

let apiHost = 'localhost';

try {
  apiHost = new URL(apiUrl).hostname;
} catch {
  apiHost = 'localhost';
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: apiUrl,
  },
  images: {
    domains: [apiHost],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
