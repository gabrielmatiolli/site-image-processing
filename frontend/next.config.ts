import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    experimental: {
        serverActions: {
            bodySizeLimit: '8mb',
        }
    },
    api: {
        responseLimit: '8mb',
        bodyParser: {
            sizeLimit: '8mb',
        }
    }
};

export default nextConfig;
