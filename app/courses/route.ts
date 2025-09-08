import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const courses = await query(`
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
      GROUP BY c.id, u.first_name, u.last_name
      ORDER BY c.created_at DESC
    `);

        return NextResponse.json(courses);
    } catch (error) {
        return NextResponse.json(
            { error: 'Error fetching courses' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, instructor_id, duration, category, level, objectives, requirements } = body;

        const result = await query(
            `INSERT INTO courses 
       (title, description, instructor_id, duration, category, level, objectives, requirements) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
            [title, description, instructor_id, duration, category, level, objectives, requirements]
        );

        return NextResponse.json(result[0]);
    } catch (error) {
        return NextResponse.json(
            { error: 'Error creating course' },
            { status: 500 }
        );
    }
}