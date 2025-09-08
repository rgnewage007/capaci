/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ['bcryptjs'],
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
    // Configuración para servir archivos estáticos
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
    // Aumentar el límite de tamaño para uploads
    api: {
        bodyParser: {
            sizeLimit: '100mb',
        },
    },
};

module.exports = nextConfig;