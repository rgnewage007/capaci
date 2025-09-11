import { NextRequest } from 'next/server';
import { query } from './db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Verificar token de acceso
export async function verifyAccess(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return false;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

        // Verificar que el usuario existe y está activo
        const userResult = await query(
            'SELECT id, status FROM users WHERE id = $1 AND deleted_at IS NULL',
            [decoded.userId]
        );

        return userResult.rows.length > 0 && userResult.rows[0].status === 'active';
    } catch (error) {
        console.error('Error verifying access:', error);
        return false;
    }
}

// Generar token JWT
export function generateToken(userId: string): string {
    return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
}

// Hashear contraseña
export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
}

// Verificar contraseña
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// Obtener usuario desde token
export async function getUserFromToken(token: string) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

        const userResult = await query(
            `SELECT id, email, first_name, last_name, role, status 
       FROM users WHERE id = $1 AND deleted_at IS NULL`,
            [decoded.userId]
        );

        return userResult.rows.length > 0 ? userResult.rows[0] : null;
    } catch (error) {
        console.error('Error getting user from token:', error);
        return null;
    }
}