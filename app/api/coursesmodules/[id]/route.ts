import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const course = await query(`
      SELECT 
        c.*,
        u.first_name as instructor_first_name,
        u.last_name as instructor_last_name,
        u.email as instructor_email,
        COUNT(DISTINCT e.id) as enrolled_students,
        COUNT(DISTINCT cert.id) as certificates_issued
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN user_course_enrollments e ON c.id = e.course_id
      LEFT JOIN certificates cert ON c.id = cert.course_id
      WHERE c.id = $1 AND c.deleted_at IS NULL
      GROUP BY c.id, u.first_name, u.last_name, u.email
    `, [params.id]);

        if (course.length === 0) {
            return NextResponse.json(
                { error: 'Course not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(course[0]);
    } catch (error) {
        return NextResponse.json(
            { error: 'Error fetching course' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { title, description, instructor_id, duration, category, level, is_active, objectives, requirements } = body;

        const result = await query(
            `UPDATE courses 
       SET title = $1, description = $2, instructor_id = $3, duration = $4, 
           category = $5, level = $6, is_active = $7, objectives = $8, requirements = $9, updated_at = NOW()
       WHERE id = $10 AND deleted_at IS NULL
       RETURNING *`,
            [title, description, instructor_id, duration, category, level, is_active, objectives, requirements, params.id]
        );

        return NextResponse.json(result[0]);
    } catch (error) {
        return NextResponse.json(
            { error: 'Error updating course' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await query(
            'UPDATE courses SET deleted_at = NOW() WHERE id = $1',
            [params.id]
        );

        return NextResponse.json({ message: 'Course deleted successfully' });
    } catch (error) {
        return NextResponse.json(
            { error: 'Error deleting course' },
            { status: 500 }
        );
    }
}