import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { generateToken, verifyPassword } from '@/lib/auth-utils';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email y contraseña son requeridos' },
                { status: 400 }
            );
        }

        // Buscar usuario
        const userResult = await query(
            `SELECT id, email, password_hash, first_name, last_name, role, status 
       FROM users WHERE email = $1 AND deleted_at IS NULL`,
            [email]
        );

        if (userResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Credenciales inválidas' },
                { status: 401 }
            );
        }

        const user = userResult.rows[0];

        // Verificar contraseña
        const isValidPassword = await verifyPassword(password, user.password_hash);
        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Credenciales inválidas' },
                { status: 401 }
            );
        }

        // Verificar estado del usuario
        if (user.status !== 'active') {
            return NextResponse.json(
                { error: 'Usuario inactivo' },
                { status: 401 }
            );
        }

        // Generar token
        const token = generateToken(user.id);

        // Actualizar último login
        await query(
            'UPDATE users SET last_login = NOW() WHERE id = $1',
            [user.id]
        );

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}