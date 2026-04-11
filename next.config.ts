import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/restaurant',
        destination: '/restaurants',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
