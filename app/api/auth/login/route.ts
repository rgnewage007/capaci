import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { generateToken, verifyPassword } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body as { email: string; password: string };

        // Validar campos requeridos
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email y contraseña son requeridos' },
                { status: 400 }
            );
        }

        // Buscar usuario en la base de datos
        const userResult = await query(
            `SELECT id, email, password_hash, first_name, last_name, role, status 
             FROM users 
             WHERE email = $1 AND deleted_at IS NULL`,
            [email]
        );

        // Verificar si el usuario existe
        if (userResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Credenciales inválidas' },
                { status: 401 }
            );
        }

        // Obtener el usuario - DETECTAR AUTOMÁTICAMENTE EL TIPO
        const row = userResult.rows[0];

        // Detectar si es array u objeto
        let user: any;
        if (Array.isArray(row)) {
            // Es un array: acceder por índices
            user = {
                id: row[0],
                email: row[1],
                password_hash: row[2],
                first_name: row[3],
                last_name: row[4],
                role: row[5],
                status: row[6]
            };
        } else {
            // Es un objeto: acceder por propiedades
            user = row;
        }

        console.log('Usuario detectado:', user);
        console.log('Password hash:', user.password_hash);

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

        // Generar token JWT
        const token = generateToken(user.id);

        // Actualizar último login
        await query(
            'UPDATE users SET last_login = NOW() WHERE id = $1',
            [user.id]
        );

        // Devolver respuesta exitosa
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
        }, { status: 200 });

    } catch (error) {
        console.error('Error en login:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}