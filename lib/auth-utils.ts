import { NextRequest } from 'next/server';
import { query } from './db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Interface para usuario
interface User {
    id: string;
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    role: string;
    status: string;
}

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

        if (userResult.rows.length === 0) {
            return false;
        }

        const row = userResult.rows[0] as any; // Usamos any temporalmente

        // Detectar el tipo de estructura
        let status: string;

        if (row && typeof row === 'object') {
            if (row.status) {
                // Es objeto con propiedades
                status = row.status;
            } else if (Array.isArray(row) && row.length >= 2) {
                // Es array: id en [0], status en [1]
                status = row[1];
            } else {
                return false;
            }
        } else {
            return false;
        }

        return status === 'active';
    } catch (error) {
        console.error('Error verifying access:', error);
        return false;
    }
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

        if (userResult.rows.length === 0) {
            return null;
        }

        const row = userResult.rows[0] as any;

        // Detectar y mapear la estructura
        if (row && typeof row === 'object') {
            if (row.id && row.email) {
                // Es objeto con propiedades
                return {
                    id: row.id,
                    email: row.email,
                    first_name: row.first_name,
                    last_name: row.last_name,
                    role: row.role,
                    status: row.status
                };
            } else if (Array.isArray(row) && row.length >= 6) {
                // Es array: acceder por índices
                return {
                    id: row[0],
                    email: row[1],
                    first_name: row[2],
                    last_name: row[3],
                    role: row[4],
                    status: row[5]
                };
            }
        }

        return null;
    } catch (error) {
        console.error('Error getting user from token:', error);
        return null;
    }
}

// Función helper para parsear filas de la base de datos
export function parseUserRow(row: any): User | null {
    if (!row) return null;

    if (row.id && row.email) {
        // Es objeto con propiedades
        return {
            id: row.id,
            email: row.email,
            password_hash: row.password_hash,
            first_name: row.first_name,
            last_name: row.last_name,
            role: row.role,
            status: row.status
        };
    } else if (Array.isArray(row) && row.length >= 7) {
        // Es array: acceder por índices
        return {
            id: row[0],
            email: row[1],
            password_hash: row[2],
            first_name: row[3],
            last_name: row[4],
            role: row[5],
            status: row[6]
        };
    }

    return null;
}

// Las otras funciones permanecen igual
export function generateToken(userId: string): string {
    return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
}

export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}