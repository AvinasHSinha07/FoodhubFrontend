import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
                pathname: "/**",   // ✅ allow all cloudinary paths
            },
            {
                protocol: "http",
                hostname: "res.cloudinary.com",
                pathname: "/**",   // ✅ allow http cloudinary paths
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "i.pravatar.cc",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "randomuser.me",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "via.placeholder.com",
                pathname: "/**",
            }
        ],
    },

    async rewrites() {
        // Proxy all /api/v1 requests to the backend API to avoid cross-domain cookie issues.
        // The backend URL is retrieved from NEXT_PUBLIC_API_URL and we remove /api/v1 if it exists so we don't duplicate it.
        const apiUrl = process.env.NEXT_PUBLIC_API_URL 
            || process.env.NEXT_PUBLIC_API_BASE_URL 
            || "http://127.0.0.1:5000/api/v1";
        
        // Remove trailing /api/v1 or / so we can cleanly append it
        const backEndBase = apiUrl.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

        return [
            {
                source: "/api/v1/:path*",
                destination: `${backEndBase}/api/v1/:path*`,
            },
        ];
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