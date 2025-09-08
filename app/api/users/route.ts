import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const users = await query(`
      SELECT 
        id, email, first_name, last_name, role, status, 
        profile_image_url, phone_number, department, position,
        last_login, created_at, updated_at
      FROM users 
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `);
        console.log('cscsacsc');
        console.log(users.rows);
        return NextResponse.json(users.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Error fetching users' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, first_name, last_name, role, password, phone_number, department, position } = body;

        console.log('Datos recibidos para nuevo usuario:', body);

        // Validaciones básicas
        if (!email || !first_name || !last_name || !password) {
            console.error('Datos incompletos:', { email, first_name, last_name, password });
            return NextResponse.json(
                { error: 'Email, nombre, apellido y contraseña son requeridos' },
                { status: 400 }
            );
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'El formato del email no es válido' },
                { status: 400 }
            );
        }

        // Validar longitud de contraseña
        if (password.length < 6) {
            return NextResponse.json(
                { error: 'La contraseña debe tener al menos 6 caracteres' },
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

        // Hash de la contraseña
        const saltRounds = 12;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Insertar usuario
        const result = await query(
            `INSERT INTO users 
       (email, first_name, last_name, role, password_hash, phone_number, department, position) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, email, first_name, last_name, role, status, created_at`,
            [
                email,
                first_name,
                last_name,
                role || 'student',
                password_hash,
                phone_number || null,
                department || null,
                position || null
            ]
        );

        console.log('Usuario creado exitosamente:', result.rows[0]);

        return NextResponse.json(result.rows[0], { status: 201 });

    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor al crear usuario' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'ID de usuario es requerido' },
                { status: 400 }
            );
        }

        // Verificar si el usuario existe
        const userCheck = await query(
            'SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL',
            [id]
        );

        if (userCheck.rows.length === 0) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        // Soft delete (marcar como eliminado)
        await query(
            'UPDATE users SET deleted_at = NOW() WHERE id = $1',
            [id]
        );

        return NextResponse.json({
            message: 'Usuario eliminado correctamente'
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor al eliminar usuario' },
            { status: 500 }
        );
    }
}