import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await request.json();

        // Verificar intentos previos
        const previousAttempts = await query(
            `SELECT COUNT(*) as attempt_count 
       FROM evaluation_attempts 
       WHERE evaluation_id = $1 AND user_id = $2 AND status = 'completed'`,
            [params.id, userId]
        );

        const attemptCount = parseInt(previousAttempts[0]?.attempt_count || '0');

        // Verificar máximo de intentos
        const evaluation = await query(
            'SELECT max_attempts FROM evaluations WHERE id = $1',
            [params.id]
        );

        if (evaluation.length === 0) {
            return NextResponse.json(
                { error: 'Evaluation not found' },
                { status: 404 }
            );
        }

        if (attemptCount >= evaluation[0].max_attempts) {
            return NextResponse.json(
                { error: 'Maximum attempts reached' },
                { status: 400 }
            );
        }

        // Crear nuevo intento
        const attemptResult = await query(
            `INSERT INTO evaluation_attempts 
       (evaluation_id, user_id, attempt_number) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
            [params.id, userId, attemptCount + 1]
        );

        return NextResponse.json(attemptResult[0]);
    } catch (error) {
        return NextResponse.json(
            { error: 'Error starting evaluation' },
            { status: 500 }
        );
    }
}