import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAccess, getUserFromToken } from '@/lib/auth-utils';

export async function POST(
    request: NextRequest,
    { params }: { params: { courseId: string } }
) {
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

        // Verificar si todos los módulos están completados
        const progressResult = await query(
            `SELECT 
         COUNT(*) as total_modules,
         COUNT(CASE WHEN up.status = 'completed' THEN 1 END) as completed_modules
       FROM course_modules cm
       LEFT JOIN user_module_progress up ON cm.id = up.module_id AND up.user_id = $1
       WHERE cm.course_id = $2 AND cm.deleted_at IS NULL`,
            [user.id, params.courseId]
        );

        const progress = progressResult.rows[0];

        if (parseInt(progress.completed_modules) !== parseInt(progress.total_modules)) {
            return NextResponse.json(
                { error: 'No has completado todos los módulos del curso' },
                { status: 400 }
            );
        }

        // Marcar curso como completado
        await query(
            `UPDATE user_course_enrollments 
       SET status = 'completed', completed_at = NOW()
       WHERE user_id = $1 AND course_id = $2`,
            [user.id, params.courseId]
        );

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error completing course:', error);
        return NextResponse.json(
            { error: 'Error al completar el curso' },
            { status: 500 }
        );
    }
}