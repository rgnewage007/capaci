import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const courseId = searchParams.get('courseId');
        const moduleId = searchParams.get('moduleId');

        let queryStr = `
      SELECT m.*, 
             u.first_name as uploaded_by_first_name,
             u.last_name as uploaded_by_last_name,
             c.title as course_title,
             mt.name as media_type
      FROM media m
      LEFT JOIN users u ON m.uploaded_by = u.id
      LEFT JOIN courses c ON m.course_id = c.id
      LEFT JOIN media_types mt ON m.media_type_id = mt.id
      WHERE m.deleted_at IS NULL
    `;

        const params: any[] = [];
        let paramCount = 1;

        if (type) {
            queryStr += ` AND mt.name = $${paramCount}`;
            params.push(type);
            paramCount++;
        }

        if (courseId) {
            queryStr += ` AND m.course_id = $${paramCount}`;
            params.push(courseId);
            paramCount++;
        }

        if (moduleId) {
            queryStr += ` AND m.module_id = $${paramCount}`;
            params.push(moduleId);
            paramCount++;
        }

        queryStr += ' ORDER BY m.created_at DESC';

        const media = await query(queryStr, params);
        return NextResponse.json(media.rows);
    } catch (error) {
        console.error('Error fetching media:', error);
        return NextResponse.json(
            { error: 'Error fetching media' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'ID is required' },
                { status: 400 }
            );
        }

        await query(
            'UPDATE media SET deleted_at = NOW() WHERE id = $1',
            [id]
        );

        return NextResponse.json({ message: 'Media deleted successfully' });
    } catch (error) {
        console.error('Error deleting media:', error);
        return NextResponse.json(
            { error: 'Error deleting media' },
            { status: 500 }
        );
    }
}