// app/api/protected-content/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAccess } from '@/lib/auth-utils'; // Utilidad simple de verificación
import fs from 'fs';
import path from 'path';

export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    try {
        // Verificar si el usuario tiene acceso
        const hasAccess = await verifyAccess(request);
        if (!hasAccess) {
            return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 401 });
        }

        // Construir la ruta al archivo
        const filePath = path.join(process.cwd(), 'protected-content', ...params.path);

        // Verificar que el archivo existe
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 });
        }

        // Determinar el tipo MIME
        let contentType = 'application/octet-stream';
        const ext = path.extname(filePath).toLowerCase();

        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
            contentType = `image/${ext.replace('.', '')}`;
            if (ext === '.jpg') contentType = 'image/jpeg';
        } else if (['.mp4', '.webm', '.ogg'].includes(ext)) {
            contentType = `video/${ext.replace('.', '')}`;
        }

        // Leer y servir el archivo
        const fileBuffer = fs.readFileSync(filePath);

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': 'inline', // Para mostrar en el navegador en lugar de descargar
                'Cache-Control': 'private, max-age=3600', // Cache privado
            },
        });
    } catch (error) {
        console.error('Error al servir archivo protegido:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}