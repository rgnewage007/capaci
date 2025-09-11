import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
    try {
        const { email, password, firstName, lastName, role = 'student' } = await request.json();

        if (!email || !password || !firstName || !lastName) {
            return NextResponse.json(
                { error: 'Todos los campos son requeridos' },
                { status: 400 }
            );
        }

        // Verificar si el usuario ya existe
        const existingUser = await query(
            'SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return NextResponse.json(
                { error: 'El usuario ya existe' },
                { status: 400 }
            );
        }

        // Hashear contraseña
        const passwordHash = await hashPassword(password);

        // Crear usuario
        const result = await query(
            `INSERT INTO users 
       (email, password_hash, first_name, last_name, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, first_name, last_name, role, status`,
            [email, passwordHash, firstName, lastName, role]
        );

        const user = result.rows[0];
        const token = generateToken(user.id);

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
        }, { status: 201 });

    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}