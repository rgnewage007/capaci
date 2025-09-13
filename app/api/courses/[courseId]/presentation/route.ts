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

// Función para parsear filas de la base de datos (pueden venir como arrays u objetos)
function parseRow(row: any, expectedType: 'course' | 'enrollment' | 'module' | 'progress'): any {
    if (!row) return null;

    // Si es un array, convertirlo a objeto según el tipo esperado
    if (Array.isArray(row)) {
        console.log('⚠️  Resultado es un array, convirtiendo a objeto...');

        switch (expectedType) {
            case 'course':
                return {
                    id: row[0],
                    title: row[1],
                    description: row[2],
                    slug: row[3],
                    instructor_id: row[4]
                };
            case 'enrollment':
                return {
                    status: row[0]
                };
            case 'module':
                return {
                    id: row[0],
                    title: row[1],
                    description: row[2],
                    order_index: row[3],
                    course_id: row[4],
                    media_id: row[5],
                    filename: row[6],
                    file_type: row[7],
                    content_type: row[8],
                    content_url: row[9],
                    external_content_url: row[10],
                    user_status: row[11],
                    is_completed: row[12],
                    is_unlocked: row[13],
                    duration: row[14]
                };
            case 'progress':
                return {
                    total_modules: row[0],
                    completed_modules: row[1]
                };
            default:
                return row; // Devolver como está si no sabemos el tipo
        }
    }

    // Si ya es un objeto, retornarlo directamente
    return row;
}

export async function GET(
    request: NextRequest,
    { params }: { params: { courseId: string } }
) {
    try {
        console.log('=== SOLICITUD PRESENTACIÓN CURSO ===');
        console.log('Parámetro recibido:', params.courseId);

        // Verificar autenticación
        const user = await verifyAccess(request);
        if (!user) {
            console.log('❌ Acceso no autorizado');
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        console.log('✅ Usuario autenticado:', user.email);

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

        console.log('Resultado de curso:', courseResult.rows);

        if (courseResult.rows.length === 0) {
            console.log('❌ Curso no encontrado');
            return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
        }

        const course = parseRow(courseResult.rows[0], 'course') as CourseRow;
        if (!course) {
            console.log('❌ Error parseando curso');
            return NextResponse.json({ error: 'Error interno' }, { status: 500 });
        }

        console.log('✅ Curso encontrado:', course.title);

        // Verificar inscripción
        const enrollmentCheck = await query(
            `SELECT status FROM user_course_enrollments 
             WHERE user_id = $1 AND course_id = $2`,
            [user.userId, course.id]
        );

        console.log('Resultado de inscripción:', enrollmentCheck.rows);

        if (enrollmentCheck.rows.length === 0) {
            console.log('❌ Usuario no inscrito');
            return NextResponse.json({ error: 'No estás inscrito en este curso' }, { status: 403 });
        }

        const enrollment = parseRow(enrollmentCheck.rows[0], 'enrollment') as EnrollmentRow;
        console.log('✅ Usuario inscrito en el curso. Estado:', enrollment.status);

        // Obtener módulos del curso - QUERY CORREGIDO
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
            [user.userId, course.id]
        );

        console.log('Resultado de módulos:', modulesResult.rows);

        const modules = modulesResult.rows
            .map(row => parseRow(row, 'module'))
            .filter(Boolean) as ModuleRow[];

        console.log('Módulos encontrados:', modules.length);

        // Obtener progreso total
        const progressResult = await query(
            `SELECT 
               COUNT(*) as total_modules,
               COUNT(CASE WHEN up.status = 'completed' THEN 1 END) as completed_modules
             FROM course_modules cm
             LEFT JOIN user_module_progress up ON cm.id = up.module_id AND up.user_id = $1
             WHERE cm.course_id = $2 AND cm.deleted_at IS NULL`,
            [user.userId, course.id]
        );

        console.log('Resultado de progreso:', progressResult.rows);

        const progress = parseRow(progressResult.rows[0], 'progress') as ProgressRow;
        const totalModules = parseInt(progress.total_modules) || 0;
        const completedModules = parseInt(progress.completed_modules) || 0;

        console.log('Progreso:', `${completedModules}/${totalModules} módulos completados`);

        // Formatear respuesta CORREGIDA - ESTA ES LA PARTE MÁS IMPORTANTE
        const mediaItems = modules.map((row: ModuleRow) => {
            // Determinar el tipo correcto - USAR content_type
            let type: 'image' | 'video' | 'exam' | 'text' = 'text';
            
            switch (row.content_type) {
                case 'image':
                    type = 'image';
                    break;
                case 'video':
                    type = 'video';
                    break;
                case 'quiz':
                    type = 'exam'; // ← Convertir 'quiz' a 'exam' para el frontend
                    break;
                case 'text':
                case 'pdf':
                case 'scorm':
                default:
                    type = 'text';
            }

            // Determinar la URL correcta
            let url = undefined;
            if (type === 'exam' && row.external_quiz_url) {
                url = row.external_quiz_url;
            } else if (row.content_url) {
                url = row.content_url;
            } else if (row.external_content_url) {
                url = row.external_content_url;
            }

            // Determinar el filename correcto
            let filename = row.filename || '';
            if (!filename && row.content_url) {
                // Extraer filename de content_url si está disponible
                filename = row.content_url.split('/').pop() || '';
            }

            return {
                id: row.id,
                type: type,
                filename: filename,
                title: row.title,
                description: row.description || '',
                duration: row.duration || 0,
                url: url,
                isUnlocked: row.is_unlocked,
                isCompleted: row.is_completed
            };
        });

        console.log('Media items formateados:', mediaItems);

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