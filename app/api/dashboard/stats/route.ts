import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const [
            totalUsers,
            totalCourses,
            totalEnrollments,
            totalCertificates,
            recentEnrollments,
            popularCourses
        ] = await Promise.all([
            // Total usuarios
            query('SELECT COUNT(*) FROM users WHERE deleted_at IS NULL'),

            // Total cursos
            query('SELECT COUNT(*) FROM courses WHERE deleted_at IS NULL AND is_active = true'),

            // Total inscripciones
            query('SELECT COUNT(*) FROM user_course_enrollments'),

            // Total certificados
            query('SELECT COUNT(*) FROM certificates'),

            // Inscripciones recientes (últimos 7 días)
            query(`
        SELECT 
          e.*,
          c.title as course_title,
          u.first_name as user_first_name,
          u.last_name as user_last_name
        FROM user_course_enrollments e
        LEFT JOIN courses c ON e.course_id = c.id
        LEFT JOIN users u ON e.user_id = u.id
        WHERE e.enrolled_at >= NOW() - INTERVAL '7 days'
        ORDER BY e.enrolled_at DESC
        LIMIT 10
      `),

            // Cursos más populares
            query(`
        SELECT 
          c.*,
          COUNT(e.id) as enrollment_count,
          u.first_name as instructor_first_name,
          u.last_name as instructor_last_name
        FROM courses c
        LEFT JOIN user_course_enrollments e ON c.id = e.course_id
        LEFT JOIN users u ON c.instructor_id = u.id
        WHERE c.deleted_at IS NULL AND c.is_active = true
        GROUP BY c.id, u.first_name, u.last_name
        ORDER BY enrollment_count DESC
        LIMIT 5
      `)
        ]);

        return NextResponse.json({
            totalUsers: parseInt(totalUsers[0]?.count || '0'),
            totalCourses: parseInt(totalCourses[0]?.count || '0'),
            totalEnrollments: parseInt(totalEnrollments[0]?.count || '0'),
            totalCertificates: parseInt(totalCertificates[0]?.count || '0'),
            recentEnrollments,
            popularCourses
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Error fetching dashboard stats' },
            { status: 500 }
        );
    }
}