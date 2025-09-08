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
        c.*,
        crs.title as course_title,
        CASE 
          WHEN c.expiration_date < NOW() THEN 'expired'
          WHEN c.expiration_date < NOW() + INTERVAL '30 days' THEN 'expiring_soon'
          ELSE 'valid'
        END as validity_status,
        EXTRACT(DAY FROM c.expiration_date - NOW()) as days_remaining
      FROM certificates c
      JOIN courses crs ON c.course_id = crs.id
      WHERE c.user_id = $1
    `;

        const queryParams: any[] = [params.id];

        if (status) {
            queryStr += ` AND validity_status = $2`;
            queryParams.push(status);
        }

        queryStr += ' ORDER BY c.issued_at DESC';

        const certificates = await query(queryStr, queryParams);
        return NextResponse.json(certificates.rows);
    } catch (error) {
        console.error('Error fetching user certificates:', error);
        return NextResponse.json(
            { error: 'Error fetching user certificates' },
            { status: 500 }
        );
    }
}