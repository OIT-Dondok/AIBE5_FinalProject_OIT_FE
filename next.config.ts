import type { NextConfig } from "next";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080").replace(/\/+$/, "");

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'dondok-s3.s3.ap-northeast-2.amazonaws.com',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${API_BASE_URL}/api/:path*`,
            },
        ];
    }
};

export default nextConfig;
