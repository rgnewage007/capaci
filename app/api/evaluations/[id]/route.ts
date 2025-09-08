import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Obtener evaluación
    const evaluationResult = await query(`
      SELECT 
        e.*,
        c.title as course_title,
        cm.title as module_title,
        u.first_name as created_by_first_name,
        u.last_name as created_by_last_name
      FROM evaluations e
      LEFT JOIN courses c ON e.course_id = c.id
      LEFT JOIN course_modules cm ON e.module_id = cm.id
      LEFT JOIN users u ON e.created_by = u.id
      WHERE e.id = $1 AND e.is_active = true
    `, [params.id]);

    if (evaluationResult.length === 0) {
      return NextResponse.json(
        { error: 'Evaluation not found' },
        { status: 404 }
      );
    }

    const evaluation = evaluationResult[0];

    // Obtener preguntas con opciones
    const questionsResult = await query(`
      SELECT 
        eq.*,
        json_agg(
          json_build_object(
            'id', qo.id,
            'option_text', qo.option_text,
            'is_correct', qo.is_correct,
            'order_index', qo.order_index
          ) ORDER BY qo.order_index
        ) as options
      FROM evaluation_questions eq
      LEFT JOIN question_options qo ON eq.id = qo.question_id
      WHERE eq.evaluation_id = $1
      GROUP BY eq.id
      ORDER BY eq.order_index
    `, [params.id]);

    return NextResponse.json({
      ...evaluation,
      questions: questionsResult
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching evaluation' },
      { status: 500 }
    );
  }
}