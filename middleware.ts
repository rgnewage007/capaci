import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas
const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/api/auth/login',
    '/api/auth/register',
    '/_next/static/:path*',
    '/_next/image/:path*',
    '/favicon.ico',
    '/uploads/:path*'
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Si es una ruta pública, permitir acceso
    const isPublicRoute = publicRoutes.some(route => {
        if (route.includes(':')) {
            const regex = new RegExp('^' + route.replace(/:\w+/g, '[^/]+') + '$');
            return regex.test(pathname);
        }
        return pathname.startsWith(route);
    });

    if (isPublicRoute) {
        return NextResponse.next();
    }

    // Verificación básica de token
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
        request.cookies.get('auth-token')?.value;

    if (!token || token.length < 30) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/courses/:path*',
        '/certificates/:path*',
        '/evaluations/:path*',
        '/reports/:path*',
        '/settings/:path*',
        '/api/:path*'
    ]
};