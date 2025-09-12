import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

// Clave secreta para JWT
const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta-temporal';

export interface AuthUser {
    userId: string;
    email: string;
    role: string;
}

// Interface para el resultado de la base de datos
interface UserRow {
    id: string;
    status: string;
}

// Verificar token de acceso y devolver usuario decodificado
export async function verifyAccess(request: NextRequest): Promise<AuthUser | null> {
    try {
        console.log('🔐 Verificando acceso...');

        const authHeader = request.headers.get('authorization');
        console.log('Authorization header:', authHeader);

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ No Bearer token found');
            return null;
        }

        const token = authHeader.substring(7);
        console.log('Token recibido:', token ? `${token.substring(0, 20)}...` : 'Empty');

        if (!token) {
            console.log('❌ Token vacío');
            return null;
        }

        // Verificar el token JWT
        const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
        console.log('✅ Token decodificado:', decoded);

        // Opcional: Verificar que el usuario existe y está activo en la BD
        try {
            const userResult = await pool.query(
                'SELECT id, status FROM users WHERE id = $1 AND status = $2 AND deleted_at IS NULL',
                [decoded.userId, 'active']
            );

            if (userResult.rows.length === 0) {
                console.log('❌ Usuario no encontrado o inactivo en BD');
                return null;
            }

            const user = userResult.rows[0] as UserRow;
            console.log('✅ Usuario verificado en BD. Estado:', user.status);
        } catch (dbError) {
            console.error('Error verificando usuario en BD:', dbError);
            // Si hay error con la BD, igual retornamos el usuario del token
        }

        return decoded;

    } catch (error) {
        console.error('❌ Error verifying access:', error);
        return null;
    }
}

// Función para generar tokens
export function generateToken(payload: AuthUser): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}