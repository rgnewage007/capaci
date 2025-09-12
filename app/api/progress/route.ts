import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAccess } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
    try {
        // Verificar autenticación
        const authResult = await verifyAccess(request);
        if (!authResult.isValid || !authResult.user) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const userId = authResult.user.userId;
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
            [userId, moduleId]
        );

        if (existingProgress.rows.length > 0) {
            // Actualizar progreso existente
            await query(
                `UPDATE user_module_progress 
                 SET status = $3, time_spent = time_spent + $4, updated_at = NOW()
                 WHERE user_id = $1 AND module_id = $2`,
                [userId, moduleId, status, timeSpent]
            );
        } else {
            // Crear nuevo registro de progreso
            await query(
                `INSERT INTO user_module_progress 
                 (user_id, module_id, course_id, status, time_spent) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [userId, moduleId, courseId, status, timeSpent]
            );
        }

        // Recalcular progreso total del curso
        const progressResult = await query(
            `SELECT 
                COUNT(*) as total_modules,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_modules
             FROM user_module_progress 
             WHERE user_id = $1 AND course_id = $2`,
            [userId, courseId]
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

export async function GET(request: NextRequest) {
    try {
        // Verificar autenticación
        const authResult = await verifyAccess(request);
        if (!authResult.isValid || !authResult.user) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const userId = authResult.user.userId;
        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get('courseId');

        if (!courseId) {
            return NextResponse.json(
                { error: 'courseId es requerido' },
                { status: 400 }
            );
        }

        // Obtener progreso del usuario para el curso
        const progressResult = await query(
            `SELECT 
                up.module_id,
                up.status,
                up.time_spent,
                up.updated_at,
                cm.title as module_title,
                cm.order_index
             FROM user_module_progress up
             LEFT JOIN course_modules cm ON up.module_id = cm.id
             WHERE up.user_id = $1 AND up.course_id = $2
             ORDER BY cm.order_index`,
            [userId, courseId]
        );

        // Obtener estadísticas generales del curso
        const statsResult = await query(
            `SELECT 
                COUNT(*) as total_modules,
                COUNT(CASE WHEN up.status = 'completed' THEN 1 END) as completed_modules,
                COALESCE(SUM(up.time_spent), 0) as total_time_spent
             FROM course_modules cm
             LEFT JOIN user_module_progress up ON cm.id = up.module_id AND up.user_id = $1
             WHERE cm.course_id = $2 AND cm.deleted_at IS NULL`,
            [userId, courseId]
        );

        return NextResponse.json({
            success: true,
            modules: progressResult.rows,
            statistics: statsResult.rows[0],
            progressPercentage: statsResult.rows[0].total_modules > 0 
                ? Math.round((statsResult.rows[0].completed_modules / statsResult.rows[0].total_modules) * 100)
                : 0
        });

    } catch (error) {
        console.error('Error fetching progress:', error);
        return NextResponse.json(
            { error: 'Error al obtener el progreso' },
            { status: 500 }
        );
    }
}