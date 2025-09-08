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
      SELECT * FROM vw_user_course_progress 
      WHERE user_id = $1
    `;

        const queryParams: any[] = [params.id];

        if (status) {
            queryStr += ` AND enrollment_status = $2`;
            queryParams.push(status);
        }

        queryStr += ' ORDER BY enrolled_at DESC';

        const courses = await query(queryStr, queryParams);

        return NextResponse.json(courses);
    } catch (error) {
        return NextResponse.json(
            { error: 'Error fetching user courses' },
            { status: 500 }
        );
    }
}