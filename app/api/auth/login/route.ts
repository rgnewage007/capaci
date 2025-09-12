import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        // DEBUG: Log los valores
        console.log('Email:', email);
        console.log('Password:', password);

        // Query a la base de datos
        const result = await pool.query(
            'SELECT id, email, password_hash, first_name, last_name, role, status FROM users WHERE email = $1 AND deleted_at IS NULL',
            [email]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
        }

        const user = result.rows[0];
        console.log('Stored hash:', user.password_hash);

        // Verificación de contraseña
        const isPasswordValid = await bcrypt.compare(password.trim(), user.password_hash);
        console.log('bcrypt.compare result:', isPasswordValid);

        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
        }

        // Login exitoso
        return NextResponse.json({
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
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}