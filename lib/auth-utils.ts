import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

// Clave secreta para JWT - usar variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta-temporal';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'tu-refresh-secret-temporal';

export interface AuthUser {
    userId: string;
    email: string;
    role: string;
}

export interface AuthResult {
    user: AuthUser | null;
    isValid: boolean;
}

// Interface para el resultado de la base de datos
interface UserRow {
    id: string;
    status: string;
}

// Verificar token de acceso y devolver usuario autenticado
export async function verifyAccess(request: NextRequest): Promise<AuthResult> {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { user: null, isValid: false };
        }

        const token = authHeader.substring(7);
        
        if (!token) {
            return { user: null, isValid: false };
        }

        // Verificar el token JWT
        const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

        // Verificar que el usuario existe y está activo en la BD
        const userResult = await pool.query(
            'SELECT id, status FROM users WHERE id = $1 AND deleted_at IS NULL',
            [decoded.userId]
        );

        if (userResult.rows.length === 0) {
            return { user: null, isValid: false };
        }

        const user = userResult.rows[0] as UserRow;
        
        if (user.status !== 'active') {
            return { user: null, isValid: false };
        }

        return { 
            user: decoded, 
            isValid: true 
        };

    } catch (error) {
        console.error('Error verifying access:', error);
        return { user: null, isValid: false };
    }
}

// Obtener usuario desde token (para uso en APIs)
export async function getUserFromToken(token: string): Promise<AuthUser | null> {
    try {
        if (!token) return null;
        
        const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
        return decoded;
    } catch (error) {
        console.error('Error getting user from token:', error);
        return null;
    }
}

// Función para generar tokens de acceso
export function generateAccessToken(payload: AuthUser): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

// Función para generar tokens de refresh
export function generateRefreshToken(payload: { userId: string; email: string }): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

// Función para verificar refresh token
export function verifyRefreshToken(token: string): { userId: string; email: string } | null {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string; email: string };
    } catch (error) {
        console.error('Error verifying refresh token:', error);
        return null;
    }
}

// Hash de contraseña (para registro)
export async function hashPassword(password: string): Promise<string> {
    const bcrypt = await import('bcryptjs');
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
}

// Comparar contraseña (para login)
export async function comparePassword(password: string, hash: string): Promise<boolean> {
    const bcrypt = await import('bcryptjs');
    return bcrypt.compare(password, hash);
}