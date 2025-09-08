import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const courseId = searchParams.get('courseId');

        let queryStr = `
      SELECT 
        c.*,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        crs.title as course_title,
        CASE 
          WHEN c.expiration_date < NOW() THEN 'expired'
          WHEN c.expiration_date < NOW() + INTERVAL '30 days' THEN 'expiring_soon'
          ELSE 'valid'
        END as validity_status
      FROM certificates c
      JOIN users u ON c.user_id = u.id
      JOIN courses crs ON c.course_id = crs.id
      WHERE 1=1
    `;

        const params: any[] = [];
        let paramCount = 1;

        if (userId) {
            queryStr += ` AND c.user_id = $${paramCount}`;
            params.push(userId);
            paramCount++;
        }

        if (courseId) {
            queryStr += ` AND c.course_id = $${paramCount}`;
            params.push(courseId);
            paramCount++;
        }

        queryStr += ' ORDER BY c.issued_at DESC';

        const certificates = await query(queryStr, params);
        return NextResponse.json(certificates.rows);
    } catch (error) {
        console.error('Error fetching certificates:', error);
        return NextResponse.json(
            { error: 'Error fetching certificates' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { user_id, course_id, score, issued_by, expiration_days = 365 } = body;

        console.log('Datos recibidos para certificado:', body);

        // Validaciones
        if (!user_id || !course_id || score === undefined || !issued_by) {
            return NextResponse.json(
                { error: 'Datos incompletos: user_id, course_id, score e issued_by son requeridos' },
                { status: 400 }
            );
        }

        if (score < 0 || score > 100) {
            return NextResponse.json(
                { error: 'El score debe estar entre 0 y 100' },
                { status: 400 }
            );
        }

        // Verificar si el usuario existe
        const userCheck = await query(
            'SELECT id, first_name, last_name FROM users WHERE id = $1 AND deleted_at IS NULL',
            [user_id]
        );

        if (userCheck.rows.length === 0) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        // Verificar si el curso existe
        const courseCheck = await query(
            'SELECT id, title FROM courses WHERE id = $1 AND deleted_at IS NULL',
            [course_id]
        );

        if (courseCheck.rows.length === 0) {
            return NextResponse.json(
                { error: 'Curso no encontrado' },
                { status: 404 }
            );
        }

        // Verificar si ya existe un certificado para este usuario y curso
        const existingCert = await query(
            'SELECT id FROM certificates WHERE user_id = $1 AND course_id = $2',
            [user_id, course_id]
        );

        if (existingCert.rows.length > 0) {
            return NextResponse.json(
                { error: 'Ya existe un certificado para este usuario y curso' },
                { status: 400 }
            );
        }

        // Generar número de certificado único
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substr(2, 9).toUpperCase();
        const certificateNumber = `CERT-${timestamp}-${randomStr}`;

        // Calcular fecha de expiración
        const expirationDate = `NOW() + INTERVAL '${expiration_days} days'`;

        // Insertar certificado
        const result = await query(
            `INSERT INTO certificates 
       (user_id, course_id, certificate_number, score, issued_by, expiration_date)
       VALUES ($1, $2, $3, $4, $5, ${expirationDate})
       RETURNING *`,
            [user_id, course_id, certificateNumber, score, issued_by]
        );

        console.log('Certificado creado exitosamente:', result.rows[0]);

        return NextResponse.json(result.rows[0], { status: 201 });

    } catch (error) {
        console.error('Error creating certificate:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor al crear certificado' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'ID de certificado es requerido' },
                { status: 400 }
            );
        }

        // Verificar si el certificado existe
        const certCheck = await query(
            'SELECT id FROM certificates WHERE id = $1',
            [id]
        );

        if (certCheck.rows.length === 0) {
            return NextResponse.json(
                { error: 'Certificado no encontrado' },
                { status: 404 }
            );
        }

        // Eliminar certificado
        await query(
            'DELETE FROM certificates WHERE id = $1',
            [id]
        );

        return NextResponse.json({
            message: 'Certificado eliminado correctamente'
        });

    } catch (error) {
        console.error('Error deleting certificate:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor al eliminar certificado' },
            { status: 500 }
        );
    }
}