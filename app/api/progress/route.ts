// app/api/progress/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { userId, courseId, moduleId, status, timeSpent, score } = await request.json();

        if (!userId || !courseId || !moduleId) {
            return NextResponse.json(
                { error: 'userId, courseId y moduleId son requeridos' },
                { status: 400 }
            );
        }

        // Verificar si ya existe un registro de progreso
        const existingProgress = await query(
            'SELECT id FROM user_progress WHERE user_id = $1 AND course_id = $2 AND module_id = $3',
            [userId, courseId, moduleId]
        );

        if (existingProgress.rows.length > 0) {
            // Actualizar progreso existente
            const result = await query(
                `UPDATE user_progress 
         SET status = $4, time_spent = time_spent + $5, score = $6, updated_at = NOW()
         WHERE user_id = $1 AND course_id = $2 AND module_id = $3
         RETURNING *`,
                [userId, courseId, moduleId, status, timeSpent, score]
            );

            return NextResponse.json(result.rows[0]);
        } else {
            // Crear nuevo registro de progreso
            const result = await query(
                `INSERT INTO user_progress 
         (user_id, course_id, module_id, status, time_spent, score) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
                [userId, courseId, moduleId, status, timeSpent, score]
            );

            return NextResponse.json(result.rows[0]);
        }
    } catch (error) {
        console.error('Error saving progress:', error);
        return NextResponse.json(
            { error: 'Error al guardar el progreso' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const courseId = searchParams.get('courseId');

        if (!userId) {
            return NextResponse.json(
                { error: 'userId es requerido' },
                { status: 400 }
            );
        }

        let queryStr = `
      SELECT up.*, cm.title as module_title, cm.content_type
      FROM user_progress up
      LEFT JOIN course_modules cm ON up.module_id = cm.id
      WHERE up.user_id = $1
    `;
        const params = [userId];

        if (courseId) {
            queryStr += ' AND up.course_id = $2';
            params.push(courseId);
        }

        const progress = await query(queryStr, params);
        return NextResponse.json(progress.rows);
    } catch (error) {
        console.error('Error fetching progress:', error);
        return NextResponse.json(
            { error: 'Error al obtener el progreso' },
            { status: 500 }
        );
    }
}