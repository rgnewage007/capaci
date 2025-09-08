import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, certificateNumber } = body;

        if (!userId || !certificateNumber) {
            return NextResponse.json(
                { error: 'userId y certificateNumber son requeridos' },
                { status: 400 }
            );
        }

        // Obtener información del certificado y usuario
        const certificateInfo = await query(`
      SELECT 
        c.*,
        u.email as user_email,
        u.first_name,
        u.last_name,
        crs.title as course_title
      FROM certificates c
      JOIN users u ON c.user_id = u.id
      JOIN courses crs ON c.course_id = crs.id
      WHERE c.user_id = $1 AND c.certificate_number = $2
    `, [userId, certificateNumber]);

        if (certificateInfo.rows.length === 0) {
            return NextResponse.json(
                { error: 'Certificado no encontrado' },
                { status: 404 }
            );
        }

        const cert = certificateInfo.rows[0];

        // Aquí iría la lógica real para enviar el email
        // Por ahora, solo simulamos el envío
        console.log('Enviando email de certificado:', {
            to: cert.user_email,
            subject: `Certificado de Completación - ${cert.course_title}`,
            certificateNumber: cert.certificate_number,
            studentName: `${cert.first_name} ${cert.last_name}`,
            courseName: cert.course_title,
            score: cert.score,
            issuedAt: cert.issued_at,
            expirationDate: cert.expiration_date
        });

        return NextResponse.json({
            success: true,
            message: 'Email enviado exitosamente',
            sentTo: cert.user_email
        });

    } catch (error) {
        console.error('Error sending certificate email:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor al enviar email' },
            { status: 500 }
        );
    }
}