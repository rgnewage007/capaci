import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAccess, getUserFromToken } from '@/lib/auth-utils';

export async function GET(
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

        // Verificar si el usuario está inscrito en el curso
        const enrollmentCheck = await query(
            `SELECT status FROM user_course_enrollments 
       WHERE user_id = $1 AND course_id = $2`,
            [user.id, params.courseId]
        );

        if (enrollmentCheck.rows.length === 0) {
            return NextResponse.json(
                { error: 'No estás inscrito en este curso' },
                { status: 403 }
            );
        }

        // Obtener información del curso
        const courseResult = await query(
            `SELECT c.*, u.first_name as instructor_first_name, u.last_name as instructor_last_name
       FROM courses c
       LEFT JOIN users u ON c.instructor_id = u.id
       WHERE c.id = $1 AND c.deleted_at IS NULL`,
            [params.courseId]
        );

        if (courseResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Curso no encontrado' },
                { status: 404 }
            );
        }

        const course = courseResult.rows[0];

        // Obtener módulos del curso
        const modulesResult = await query(
            `SELECT cm.*, m.filename, m.file_type,
              up.status as user_status,
              CASE 
                WHEN up.status = 'completed' THEN true
                ELSE false
              END as is_completed,
              CASE 
                WHEN cm.order_index = 1 THEN true
                WHEN EXISTS (
                  SELECT 1 FROM user_module_progress ump 
                  WHERE ump.module_id = cm.previous_module_id 
                  AND ump.user_id = $1 
                  AND ump.status = 'completed'
                ) THEN true
                ELSE false
              END as is_unlocked
       FROM course_modules cm
       LEFT JOIN media m ON cm.media_id = m.id
       LEFT JOIN user_module_progress up ON cm.id = up.module_id AND up.user_id = $1
       WHERE cm.course_id = $2 AND cm.deleted_at IS NULL
       ORDER BY cm.order_index`,
            [user.id, params.courseId]
        );

        const mediaItems = modulesResult.rows.map((row: any) => ({
            id: row.id,
            type: row.file_type?.split('/')[0] || 'text',
            filename: row.filename,
            title: row.title,
            description: row.description,
            duration: row.duration,
            isUnlocked: row.is_unlocked,
            isCompleted: row.is_completed
        }));

        // Obtener progreso total
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

        return NextResponse.json({
            id: course.id,
            title: course.title,
            description: course.description,
            totalModules: parseInt(progress.total_modules),
            completedModules: parseInt(progress.completed_modules),
            mediaItems
        });

    } catch (error) {
        console.error('Error fetching course presentation:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}