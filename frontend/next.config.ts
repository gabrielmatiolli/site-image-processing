import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    experimental: {
        serverActions: {
            bodySizeLimit: '8mb',
        }
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'n8xdo0r4mkljgdjs.public.blob.vercel-storage.com',
                port: '',
                pathname: '/**',
            },
        ],
    }
};

export default nextConfig;
