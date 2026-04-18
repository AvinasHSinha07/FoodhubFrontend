import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
                pathname: "/**",   // ✅ allow all cloudinary paths
            },
        ],
    },

    async redirects() {
        return [
            {
                source: "/restaurant",
                destination: "/restaurants",
                permanent: true,
            },
        ];
    },

    // ✅ FIX: Required for cross-origin credentials to work
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "Access-Control-Allow-Credentials",
                        value: "true",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;