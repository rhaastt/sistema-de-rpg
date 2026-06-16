import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true,
    // Uploads de imagem de campanha trafegam pelo Server Action (até 2 MB).
    serverActions: {
      bodySizeLimit: '3mb',
    },
  },
};

export default nextConfig;
