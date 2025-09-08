import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const modules = await query(`
      SELECT 
        cm.*,
        m.filename as media_filename,
        m.file_type as media_type,
        m.thumbnail_url as media_thumbnail,
        m.duration as media_duration
      FROM course_modules cm
      LEFT JOIN media m ON cm.media_id = m.id
      WHERE cm.course_id = $1 AND cm.deleted_at IS NULL
      ORDER BY cm.order_index
    `, [params.id]);

        return NextResponse.json(modules);
    } catch (error) {
        return NextResponse.json(
            { error: 'Error fetching course modules' },
            { status: 500 }
        );
    }
}