import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAccess, getUserFromToken } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
    try {
        // Verificar autenticación
        const hasAccess = await verifyAccess(request);
        if (!hasAccess) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        // Obtener información del usuario para permisos
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        const user = token ? await getUserFromToken(token) : null;

        let queryStr = `
      SELECT 
        c.*,
        u.first_name as instructor_first_name,
        u.last_name as instructor_last_name,
        COUNT(e.id) as enrolled_students,
        COUNT(DISTINCT cert.id) as certificates_issued
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN user_course_enrollments e ON c.id = e.course_id
      LEFT JOIN certificates cert ON c.id = cert.course_id
      WHERE c.deleted_at IS NULL
    `;

        // Si es estudiante, solo mostrar cursos activos
        if (user && user.role === 'student') {
            queryStr += ' AND c.is_active = true';
        }

        queryStr += ' GROUP BY c.id, u.first_name, u.last_name ORDER BY c.created_at DESC';

        const courses = await query(queryStr);
        return NextResponse.json(courses.rows);

    } catch (error) {
        console.error('Error fetching courses:', error);
        return NextResponse.json(
            { error: 'Error fetching courses' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // Verificar autenticación y permisos (solo admin/instructor)
        const hasAccess = await verifyAccess(request);
        if (!hasAccess) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        const user = token ? await getUserFromToken(token) : null;

        if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
            return NextResponse.json(
                { error: 'Permisos insuficientes' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { title, description, instructor_id, duration, category, level, objectives, requirements } = body;

        // Si es instructor, solo puede asignarse a sí mismo
        const actualInstructorId = user.role === 'instructor' ? user.id : instructor_id;

        const result = await query(
            `INSERT INTO courses 
       (title, description, instructor_id, duration, category, level, objectives, requirements) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
            [title, description, actualInstructorId, duration, category, level, objectives, requirements]
        );

        return NextResponse.json(result.rows[0]);

    } catch (error) {
        console.error('Error creating course:', error);
        return NextResponse.json(
            { error: 'Error creating course' },
            { status: 500 }
        );
    }
}