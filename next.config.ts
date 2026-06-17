import type { NextConfig } from "next";
// @ts-expect-error next-pwa lacks type declarations
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
});

const nextConfig: NextConfig = {
    turbopack: {},
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
                destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/:path*`,
            },
        ];
    }
};

export default withPWA(nextConfig);