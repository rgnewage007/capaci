import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const courseId = searchParams.get('courseId');

        let queryStr = `
      SELECT 
        e.*,
        c.title as course_title,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        COUNT(DISTINCT mp.module_id) as completed_modules,
        COUNT(DISTINCT cm.id) as total_modules
      FROM user_course_enrollments e
      LEFT JOIN courses c ON e.course_id = c.id
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN course_modules cm ON e.course_id = cm.course_id AND cm.deleted_at IS NULL
      LEFT JOIN user_module_progress mp ON e.user_id = mp.user_id AND cm.id = mp.module_id AND mp.status = 'completed'
      WHERE e.course_id IS NOT NULL
    `;

        const params: any[] = [];
        let paramCount = 1;

        if (userId) {
            queryStr += ` AND e.user_id = $${paramCount}`;
            params.push(userId);
            paramCount++;
        }

        if (courseId) {
            queryStr += ` AND e.course_id = $${paramCount}`;
            params.push(courseId);
            paramCount++;
        }

        queryStr += ' GROUP BY e.id, c.title, u.first_name, u.last_name ORDER BY e.enrolled_at DESC';

        const enrollments = await query(queryStr, params);

        return NextResponse.json(enrollments);
    } catch (error) {
        return NextResponse.json(
            { error: 'Error fetching enrollments' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { user_id, course_id } = body;

        // Verificar si ya está inscrito
        const existing = await query(
            'SELECT id FROM user_course_enrollments WHERE user_id = $1 AND course_id = $2',
            [user_id, course_id]
        );

        if (existing.length > 0) {
            return NextResponse.json(
                { error: 'User already enrolled in this course' },
                { status: 400 }
            );
        }

        const result = await query(
            `INSERT INTO user_course_enrollments (user_id, course_id) 
       VALUES ($1, $2) 
       RETURNING *`,
            [user_id, course_id]
        );

        return NextResponse.json(result[0]);
    } catch (error) {
        return NextResponse.json(
            { error: 'Error creating enrollment' },
            { status: 500 }
        );
    }
}