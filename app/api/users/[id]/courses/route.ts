import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        let queryStr = `
      SELECT 
        e.*,
        c.title as course_title,
        c.category as course_category,
        c.level as course_level,
        c.thumbnail_url as course_thumbnail,
        COUNT(DISTINCT CASE WHEN mp.status = 'completed' THEN mp.module_id END) as completed_modules,
        COUNT(DISTINCT cm.id) as total_modules,
        CASE 
          WHEN COUNT(DISTINCT cm.id) > 0 THEN 
            ROUND((COUNT(DISTINCT CASE WHEN mp.status = 'completed' THEN mp.module_id END) * 100.0 / COUNT(DISTINCT cm.id))) 
          ELSE 0 
        END as progress_percentage
      FROM user_course_enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN course_modules cm ON c.id = cm.course_id AND cm.deleted_at IS NULL
      LEFT JOIN user_module_progress mp ON e.user_id = mp.user_id AND cm.id = mp.module_id
      WHERE e.user_id = $1
    `;

        const queryParams: any[] = [params.id];

        if (status) {
            queryStr += ` AND e.status = $2`;
            queryParams.push(status);
        }

        queryStr += ' GROUP BY e.id, c.title, c.category, c.level, c.thumbnail_url ORDER BY e.enrolled_at DESC';

        const courses = await query(queryStr, queryParams);
        return NextResponse.json(courses.rows);
    } catch (error) {
        console.error('Error fetching user courses:', error);
        return NextResponse.json(
            { error: 'Error fetching user courses' },
            { status: 500 }
        );
    }
}