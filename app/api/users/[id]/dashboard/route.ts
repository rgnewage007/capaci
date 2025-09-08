import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = params.id;

        // Obtener resumen general
        const [summary, certificates, recentProgress, upcomingExpirations] = await Promise.all([
            // Resumen general
            query('SELECT * FROM vw_user_progress_summary WHERE user_id = $1', [userId]),

            // Certificados
            query('SELECT * FROM vw_user_certificates WHERE user_id = $1 ORDER BY issued_at DESC', [userId]),

            // Progreso reciente
            query(`
        SELECT * FROM vw_user_course_progress 
        WHERE user_id = $1 
        ORDER BY enrolled_at DESC 
        LIMIT 5
      `, [userId]),

            // Certificados próximos a expirar
            query(`
        SELECT * FROM vw_user_certificates 
        WHERE user_id = $1 AND validity_status = 'expiring_soon'
        ORDER BY expiration_date ASC
        LIMIT 5
      `, [userId])
        ]);

        // Estadísticas adicionales
        const stats = await query(`
      SELECT 
        COUNT(DISTINCT course_id) as active_courses,
        SUM(total_time_spent) as total_learning_time,
        AVG(progress_percentage) as overall_progress,
        COUNT(DISTINCT CASE WHEN enrollment_status = 'completed' THEN course_id END) as completed_this_month
      FROM vw_user_course_progress 
      WHERE user_id = $1 
        AND enrolled_at >= DATE_TRUNC('month', CURRENT_DATE)
    `, [userId]);

        return NextResponse.json({
            summary: summary[0] || {},
            certificates: certificates || [],
            recentProgress: recentProgress || [],
            upcomingExpirations: upcomingExpirations || [],
            statistics: stats[0] || {}
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Error fetching user dashboard' },
            { status: 500 }
        );
    }
}