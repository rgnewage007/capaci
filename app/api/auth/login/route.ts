import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

// Clave secreta para JWT - usa variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta-temporal';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'tu-refresh-secret-temporal';

export async function POST(request: NextRequest) {
    try {
        console.log('=== INICIO DE SOLICITUD LOGIN ===');

        const { email, password } = await request.json();

        console.log('Email recibido:', email);
        console.log('Password recibido:', password);

        if (!email || !password) {
            return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 });
        }

        // Query a la base de datos
        const result = await pool.query(
            'SELECT id, email, password_hash, first_name, last_name, role, status FROM users WHERE email = $1 AND deleted_at IS NULL',
            [email]
        );

        console.log('Usuarios encontrados:', result.rows.length);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
        }

        const user = result.rows[0];
        console.log('Usuario DB:', user);

        // Verificación de contraseña
        const isPasswordValid = await bcrypt.compare(password.trim(), user.password_hash);
        console.log('Password válido:', isPasswordValid);

        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
        }

        // Generar tokens JWT
        const accessToken = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            {
                userId: user.id,
                email: user.email
            },
            JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        console.log('Tokens generados correctamente');

        // Login exitoso
        return NextResponse.json({
            token: accessToken,
            refreshToken: refreshToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('❌ ERROR en login:', error);
        return NextResponse.json({
            error: 'Error interno del servidor'
        }, { status: 500 });
    }
}