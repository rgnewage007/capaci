import { NextRequest, NextResponse } from 'next/server';
import { query } from './db';
import jwt from 'jsonwebtoken';

export async function verifyApiAuth(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return { success: false, error: 'No token provided', status: 401 };
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

        const userResult = await query(
            'SELECT id, status FROM users WHERE id = $1 AND deleted_at IS NULL',
            [decoded.userId]
        );

        if (userResult.rows.length === 0) {
            return { success: false, error: 'User not found', status: 404 };
        }

        if (userResult.rows[0].status !== 'active') {
            return { success: false, error: 'User inactive', status: 403 };
        }

        return { success: true, userId: decoded.userId };
    } catch (error) {
        return { success: false, error: 'Invalid token', status: 401 };
    }
}