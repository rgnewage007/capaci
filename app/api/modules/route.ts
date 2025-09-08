import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const modules = await query(`
      SELECT 
        cm.*,
        c.title as course_title,
        m.filename as media_filename,
        m.file_type as media_type
      FROM course_modules cm
      LEFT JOIN courses c ON cm.course_id = c.id
      LEFT JOIN media m ON cm.media_id = m.id
      WHERE cm.deleted_at IS NULL
      ORDER BY cm.created_at DESC
    `);

        return NextResponse.json(modules);
    } catch (error) {
        return NextResponse.json(
            { error: 'Error fetching modules' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { course_id, title, description, content_type, media_id, order_index, duration, is_published } = body;

        const result = await query(
            `INSERT INTO course_modules 
       (course_id, title, description, content_type, media_id, order_index, duration, is_published) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
            [course_id, title, description, content_type, media_id, order_index, duration, is_published]
        );

        return NextResponse.json(result[0]);
    } catch (error) {
        return NextResponse.json(
            { error: 'Error creating module' },
            { status: 500 }
        );
    }
}