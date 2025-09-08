import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'userId is required' },
                { status: 400 }
            );
        }

        // Obtener todos los intentos del usuario
        const attempts = await query(`
      SELECT 
        ea.*,
        e.title as evaluation_title,
        e.passing_score
      FROM evaluation_attempts ea
      LEFT JOIN evaluations e ON ea.evaluation_id = e.id
      WHERE ea.evaluation_id = $1 AND ea.user_id = $2
      ORDER BY ea.attempt_number DESC
    `, [params.id, userId]);

        // Obtener estadísticas
        const stats = await query(`
      SELECT 
        COUNT(*) as total_attempts,
        MAX(score) as best_score,
        AVG(score) as average_score,
        COUNT(CASE WHEN score >= passing_score THEN 1 END) as passed_attempts
      FROM evaluation_attempts ea
      LEFT JOIN evaluations e ON ea.evaluation_id = e.id
      WHERE ea.evaluation_id = $1 AND ea.user_id = $2
    `, [params.id, userId]);

        return NextResponse.json({
            attempts,
            statistics: stats[0]
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Error fetching results' },
            { status: 500 }
        );
    }
}