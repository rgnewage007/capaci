/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ['pg', 'bcryptjs'],
    },
    images: {
        domains: ['localhost'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    async headers() {
        return [
            {
                source: '/uploads/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
    api: {
        bodyParser: {
            sizeLimit: '100mb',
        },
    },
    // ✅ SOLO ESTA PARTE NUEVA
    webpack: (config, { isServer, webpack }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                crypto: false,
                stream: false,
            };
        }
        return config;
    },
};

module.exports = nextConfig;