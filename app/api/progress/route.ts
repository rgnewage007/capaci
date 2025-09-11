import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAccess, getUserFromToken } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
    try {
        // Verificar autenticación
        const hasAccess = await verifyAccess(request);
        if (!hasAccess) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        const user = token ? await getUserFromToken(token) : null;

        if (!user) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        const { moduleId, courseId, status = 'completed' } = await request.json();

        // Verificar si ya existe progreso
        const existingProgress = await query(
            'SELECT id FROM user_module_progress WHERE user_id = $1 AND module_id = $2',
            [user.id, moduleId]
        );

        if (existingProgress.rows.length > 0) {
            // Actualizar progreso existente
            await query(
                `UPDATE user_module_progress 
         SET status = $3, updated_at = NOW()
         WHERE user_id = $1 AND module_id = $2`,
                [user.id, moduleId, status]
            );
        } else {
            // Crear nuevo registro de progreso
            await query(
                `INSERT INTO user_module_progress 
         (user_id, module_id, course_id, status) 
         VALUES ($1, $2, $3, $4)`,
                [user.id, moduleId, courseId, status]
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error saving progress:', error);
        return NextResponse.json(
            { error: 'Error al guardar el progreso' },
            { status: 500 }
        );
    }
}