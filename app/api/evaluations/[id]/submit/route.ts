import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId, attemptId, answers, timeSpent } = await request.json();

        // Verificar intento
        const attempt = await query(
            'SELECT * FROM evaluation_attempts WHERE id = $1 AND user_id = $2 AND status = $3',
            [attemptId, userId, 'in-progress']
        );

        if (attempt.length === 0) {
            return NextResponse.json(
                { error: 'Invalid attempt' },
                { status: 400 }
            );
        }

        // Calcular puntaje
        let correctAnswers = 0;
        let totalQuestions = 0;

        for (const answer of answers) {
            const correctOptions = await query(
                'SELECT id FROM question_options WHERE question_id = $1 AND is_correct = true',
                [answer.questionId]
            );

            totalQuestions++;

            // Verificar si la respuesta es correcta
            const userSelected = answer.selectedOptions;
            const correctIds = correctOptions.map((opt: any) => opt.id);

            const isCorrect =
                userSelected.length === correctIds.length &&
                userSelected.every((optId: string) => correctIds.includes(optId));

            if (isCorrect) {
                correctAnswers++;
            }
        }

        const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

        // Actualizar intento
        const updatedAttempt = await query(
            `UPDATE evaluation_attempts 
       SET completed_at = NOW(), time_spent = $1, score = $2, status = 'completed', user_answers = $3
       WHERE id = $4 
       RETURNING *`,
            [timeSpent, score, JSON.stringify(answers), attemptId]
        );

        return NextResponse.json({
            attempt: updatedAttempt[0],
            score,
            correctAnswers,
            totalQuestions,
            passed: score >= (await query('SELECT passing_score FROM evaluations WHERE id = $1', [params.id]))[0].passing_score
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Error submitting evaluation' },
            { status: 500 }
        );
    }
}