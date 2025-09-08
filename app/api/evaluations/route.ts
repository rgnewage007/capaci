import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get('courseId');
        const moduleId = searchParams.get('moduleId');

        let queryStr = `
      SELECT 
        e.*,
        c.title as course_title,
        cm.title as module_title,
        u.first_name as created_by_first_name,
        u.last_name as created_by_last_name,
        COUNT(DISTINCT eq.id) as questions_count
      FROM evaluations e
      LEFT JOIN courses c ON e.course_id = c.id
      LEFT JOIN course_modules cm ON e.module_id = cm.id
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN evaluation_questions eq ON e.id = eq.evaluation_id
      WHERE e.is_active = true
    `;

        const params: any[] = [];
        let paramCount = 1;

        if (courseId) {
            queryStr += ` AND e.course_id = $${paramCount}`;
            params.push(courseId);
            paramCount++;
        }

        if (moduleId) {
            queryStr += ` AND e.module_id = $${paramCount}`;
            params.push(moduleId);
            paramCount++;
        }

        queryStr += ' GROUP BY e.id, c.title, cm.title, u.first_name, u.last_name ORDER BY e.created_at DESC';

        const evaluations = await query(queryStr, params);
        return NextResponse.json(evaluations);
    } catch (error) {
        return NextResponse.json(
            { error: 'Error fetching evaluations' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            title, description, course_id, module_id, time_limit,
            passing_score, max_attempts, shuffle_questions, shuffle_options,
            show_correct_answers, questions
        } = body;

        // Insertar evaluación
        const evaluationResult = await query(
            `INSERT INTO evaluations 
       (title, description, course_id, module_id, time_limit, passing_score, 
        max_attempts, shuffle_questions, shuffle_options, show_correct_answers) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
            [title, description, course_id, module_id, time_limit, passing_score,
                max_attempts, shuffle_questions, shuffle_options, show_correct_answers]
        );

        const evaluation = evaluationResult[0];

        // Insertar preguntas y opciones
        for (const questionData of questions) {
            const questionResult = await query(
                `INSERT INTO evaluation_questions 
         (evaluation_id, question_text, question_type, points, order_index, explanation) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
                [evaluation.id, questionData.question_text, questionData.question_type,
                questionData.points, questionData.order_index, questionData.explanation]
            );

            const question = questionResult[0];

            for (const optionData of questionData.options) {
                await query(
                    `INSERT INTO question_options 
           (question_id, option_text, is_correct, order_index) 
           VALUES ($1, $2, $3, $4)`,
                    [question.id, optionData.option_text, optionData.is_correct, optionData.order_index]
                );
            }
        }

        return NextResponse.json(evaluation);
    } catch (error) {
        return NextResponse.json(
            { error: 'Error creating evaluation' },
            { status: 500 }
        );
    }
}