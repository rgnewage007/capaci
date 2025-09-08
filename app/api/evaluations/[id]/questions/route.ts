import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const attemptId = searchParams.get('attemptId');

        if (!userId || !attemptId) {
            return NextResponse.json(
                { error: 'userId and attemptId are required' },
                { status: 400 }
            );
        }

        // Verificar que el intento pertenece al usuario
        const attemptCheck = await query(
            'SELECT id FROM evaluation_attempts WHERE id = $1 AND user_id = $2 AND status = $3',
            [attemptId, userId, 'in-progress']
        );

        if (attemptCheck.length === 0) {
            return NextResponse.json(
                { error: 'Invalid attempt' },
                { status: 400 }
            );
        }

        // Obtener configuración de la evaluación
        const evaluation = await query(
            'SELECT shuffle_questions, shuffle_options FROM evaluations WHERE id = $1',
            [params.id]
        );

        if (evaluation.length === 0) {
            return NextResponse.json(
                { error: 'Evaluation not found' },
                { status: 404 }
            );
        }

        // Obtener preguntas (mezclar si está configurado)
        let questionsQuery = `
      SELECT 
        eq.id,
        eq.question_text,
        eq.question_type,
        eq.points,
        eq.explanation,
        json_agg(
          json_build_object(
            'id', qo.id,
            'option_text', qo.option_text,
            'order_index', qo.order_index
          ) ORDER BY ${evaluation[0].shuffle_options ? 'RANDOM()' : 'qo.order_index'}
        ) as options
      FROM evaluation_questions eq
      LEFT JOIN question_options qo ON eq.id = qo.question_id
      WHERE eq.evaluation_id = $1
      GROUP BY eq.id
      ${evaluation[0].shuffle_questions ? 'ORDER BY RANDOM()' : 'ORDER BY eq.order_index'}
    `;

        const questions = await query(questionsQuery, [params.id]);

        // Ocultar respuestas correctas
        const sanitizedQuestions = questions.map((q: any) => ({
            ...q,
            options: q.options.map((opt: any) => ({
                id: opt.id,
                option_text: opt.option_text,
                order_index: opt.order_index
            }))
        }));

        return NextResponse.json(sanitizedQuestions);
    } catch (error) {
        return NextResponse.json(
            { error: 'Error fetching questions' },
            { status: 500 }
        );
    }
}