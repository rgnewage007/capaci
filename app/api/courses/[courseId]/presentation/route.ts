import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAccess } from '@/lib/auth-utils';

// Interfaces para los resultados de la base de datos
interface CourseRow {
    id: string;
    title: string;
    description: string;
    slug?: string;
    instructor_id?: string;
}

interface EnrollmentRow {
    status: string;
}

interface ModuleRow {
    id: string;
    title: string;
    description: string;
    order_index: number;
    course_id: string;
    media_id?: string;
    filename?: string;
    file_type?: string;
    content_type: string;
    content_url?: string;
    external_content_url?: string;
    user_status?: string;
    is_completed: boolean;
    is_unlocked: boolean;
    duration?: number;
}

interface ProgressRow {
    total_modules: string;
    completed_modules: string;
}

interface MediaItem {
    id: string;
    type: 'image' | 'video' | 'exam' | 'text';
    filename: string;
    title: string;
    description: string;
    duration?: number;
    url?: string;
    isUnlocked: boolean;
    isCompleted: boolean;
}

export async function GET(
    request: NextRequest,
    { params }: { params: { courseId: string } }
) {
    try {
        console.log('=== SOLICITUD PRESENTACIÓN CURSO ===');
        console.log('Parámetro recibido:', params.courseId);

        // Verificar autenticación - CORREGIDO para nueva interfaz
        const authResult = await verifyAccess(request);
        if (!authResult.isValid || !authResult.user) {
            console.log('❌ Acceso no autorizado');
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const userId = authResult.user.userId;
        console.log('✅ Usuario autenticado:', authResult.user.email);

        // Determinar si es UUID o slug
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.courseId);

        // Obtener información del curso
        const courseQuery = isUUID
            ? `SELECT c.*, u.first_name as instructor_first_name, u.last_name as instructor_last_name
               FROM courses c
               LEFT JOIN users u ON c.instructor_id = u.id
               WHERE c.id = $1 AND c.deleted_at IS NULL`
            : `SELECT c.*, u.first_name as instructor_first_name, u.last_name as instructor_last_name
               FROM courses c
               LEFT JOIN users u ON c.instructor_id = u.id
               WHERE c.slug = $1 AND c.deleted_at IS NULL`;

        const courseResult = await query(courseQuery, [params.courseId]);

        if (courseResult.rows.length === 0) {
            console.log('❌ Curso no encontrado');
            return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
        }

        const course = courseResult.rows[0] as CourseRow;

        console.log('✅ Curso encontrado:', course.title);

        // Verificar inscripción
        const enrollmentCheck = await query(
            `SELECT status FROM user_course_enrollments 
             WHERE user_id = $1 AND course_id = $2`,
            [userId, course.id]
        );

        if (enrollmentCheck.rows.length === 0) {
            console.log('❌ Usuario no inscrito');
            return NextResponse.json({ error: 'No estás inscrito en este curso' }, { status: 403 });
        }

        const enrollment = enrollmentCheck.rows[0] as EnrollmentRow;
        console.log('✅ Usuario inscrito en el curso. Estado:', enrollment.status);

        // Obtener módulos del curso
        const modulesResult = await query(
            `SELECT 
                cm.id,
                cm.title,
                cm.description,
                cm.order_index,
                cm.course_id,
                cm.media_id,
                cm.duration,
                cm.content_type,
                cm.content_url,
                cm.external_content_url,
                cm.external_quiz_url,
                cm.quiz_title,
                cm.is_free_preview,
                m.filename,
                m.file_type,
                up.status as user_status,
                CASE 
                    WHEN up.status = 'completed' THEN true 
                    ELSE false 
                END as is_completed,
                -- Lógica de desbloqueo basada en order_index
                CASE 
                    WHEN cm.order_index = 1 THEN true
                    WHEN EXISTS (
                        SELECT 1 
                        FROM user_module_progress ump 
                        JOIN course_modules prev_cm ON prev_cm.course_id = cm.course_id 
                        AND prev_cm.order_index = cm.order_index - 1
                        WHERE ump.module_id = prev_cm.id 
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
            [userId, course.id]
        );

        const modules = modulesResult.rows as ModuleRow[];
        console.log('Módulos encontrados:', modules.length);

        // Obtener progreso total
        const progressResult = await query(
            `SELECT 
               COUNT(*) as total_modules,
               COUNT(CASE WHEN up.status = 'completed' THEN 1 END) as completed_modules
             FROM course_modules cm
             LEFT JOIN user_module_progress up ON cm.id = up.module_id AND up.user_id = $1
             WHERE cm.course_id = $2 AND cm.deleted_at IS NULL`,
            [userId, course.id]
        );

        const progress = progressResult.rows[0] as ProgressRow;
        const totalModules = parseInt(progress.total_modules) || 0;
        const completedModules = parseInt(progress.completed_modules) || 0;

        console.log('Progreso:', `${completedModules}/${totalModules} módulos completados`);

        // Formatear respuesta CORREGIDA
        const mediaItems: MediaItem[] = modules.map((row: ModuleRow) => {
            // Determinar el tipo basado en content_type
            let type: 'image' | 'video' | 'exam' | 'text' = 'text';
            
            switch (row.content_type) {
                case 'image':
                    type = 'image';
                    break;
                case 'video':
                    type = 'video';
                    break;
                case 'quiz':
                    type = 'exam';
                    break;
                default:
                    type = 'text';
            }

            return {
                id: row.id,
                type: type,
                filename: row.filename || '',
                title: row.title,
                description: row.description || '',
                duration: row.duration || 0,
                url: row.content_url || row.external_content_url || undefined,
                isUnlocked: row.is_unlocked,
                isCompleted: row.is_completed
            };
        });

        console.log('Media items formateados:', mediaItems.length);

        return NextResponse.json({
            id: course.id,
            title: course.title,
            description: course.description,
            totalModules: totalModules,
            completedModules: completedModules,
            mediaItems: mediaItems
        });

    } catch (error) {
        console.error('❌ Error en presentation API:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}