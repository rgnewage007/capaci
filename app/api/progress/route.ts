import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAccess } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
    try {
        // Verificar autenticación
        const authResult = await verifyAccess(request);
        if (!authResult || !authResult.userId) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const { moduleId, courseId, status = 'completed', timeSpent = 0 } = await request.json();

        if (!moduleId || !courseId) {
            return NextResponse.json(
                { error: 'moduleId y courseId son requeridos' },
                { status: 400 }
            );
        }

        // Verificar si ya existe progreso
        const existingProgress = await query(
            'SELECT id FROM user_module_progress WHERE user_id = $1 AND module_id = $2',
            [authResult.userId, moduleId]
        );

        if (existingProgress.rows.length > 0) {
            // Actualizar progreso existente
            await query(
                `UPDATE user_module_progress 
                 SET status = $3, time_spent = time_spent + $4, updated_at = NOW()
                 WHERE user_id = $1 AND module_id = $2`,
                [authResult.userId, moduleId, status, timeSpent]
            );
        } else {
            // Crear nuevo registro de progreso
            await query(
                `INSERT INTO user_module_progress 
                 (user_id, module_id, course_id, status, time_spent) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [authResult.userId, moduleId, courseId, status, timeSpent]
            );
        }

        // Recalcular progreso total del curso
        const progressResult = await query(
            `SELECT 
                COUNT(*) as total_modules,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_modules
             FROM user_module_progress 
             WHERE user_id = $1 AND course_id = $2`,
            [authResult.userId, courseId]
        );

        return NextResponse.json({ 
            success: true,
            progress: progressResult.rows[0]
        });

    } catch (error) {
        console.error('Error saving progress:', error);
        return NextResponse.json(
            { error: 'Error al guardar el progreso' },
            { status: 500 }
        );
    }
}