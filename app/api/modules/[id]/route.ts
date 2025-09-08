import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const module = await query(`
      SELECT 
        cm.*,
        c.title as course_title,
        m.filename as media_filename,
        m.file_type as media_type,
        m.file_path as media_path,
        m.thumbnail_url as media_thumbnail,
        m.duration as media_duration
      FROM course_modules cm
      LEFT JOIN courses c ON cm.course_id = c.id
      LEFT JOIN media m ON cm.media_id = m.id
      WHERE cm.id = $1 AND cm.deleted_at IS NULL
    `, [params.id]);

        if (module.length === 0) {
            return NextResponse.json(
                { error: 'Module not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(module[0]);
    } catch (error) {
        return NextResponse.json(
            { error: 'Error fetching module' },
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
        const { title, description, content_type, media_id, order_index, duration, is_published } = body;

        const result = await query(
            `UPDATE course_modules 
       SET title = $1, description = $2, content_type = $3, media_id = $4, 
           order_index = $5, duration = $6, is_published = $7, updated_at = NOW()
       WHERE id = $8 AND deleted_at IS NULL
       RETURNING *`,
            [title, description, content_type, media_id, order_index, duration, is_published, params.id]
        );

        return NextResponse.json(result[0]);
    } catch (error) {
        return NextResponse.json(
            { error: 'Error updating module' },
            { status: 500 }
        );
    }
}