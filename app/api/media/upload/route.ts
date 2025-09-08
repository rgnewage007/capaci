import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const courseId = formData.get('courseId') as string;
        const moduleId = formData.get('moduleId') as string;
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;

        if (!file) {
            return NextResponse.json(
                { error: 'No se proporcionó ningún archivo' },
                { status: 400 }
            );
        }

        // Validar tipo de archivo
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/webm', 'video/quicktime'
        ];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Tipo de archivo no permitido' },
                { status: 400 }
            );
        }

        // Validar tamaño (máximo 100MB)
        const maxSize = 100 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'El archivo es demasiado grande (máximo 100MB)' },
                { status: 400 }
            );
        }

        const uploadsDir = join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadsDir, { recursive: true });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generar nombre único
        const fileExtension = file.name.split('.').pop();
        const uniqueName = `${uuidv4()}.${fileExtension}`;
        const filePath = join(uploadsDir, uniqueName);

        // Guardar archivo
        await writeFile(filePath, buffer);

        // Determinar tipo de media
        const mediaType = file.type.startsWith('image') ? 'image' :
            file.type.startsWith('video') ? 'video' : 'document';

        // Insertar en base de datos
        const result = await query(
            `INSERT INTO media 
       (title, description, filename, original_filename, file_path, 
        file_size, file_type, media_type_id, course_id, module_id, uploaded_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 
               (SELECT id FROM media_types WHERE name = $8), $9, $10, $11) 
       RETURNING *`,
            [
                title || file.name,
                description || '',
                uniqueName,
                file.name,
                `/uploads/${uniqueName}`,
                file.size,
                file.type,
                mediaType,
                courseId || null,
                moduleId || null,
                'admin' // ID del usuario que sube (deberías obtenerlo de la sesión)
            ]
        );

        return NextResponse.json({
            success: true,
            message: 'Archivo subido exitosamente',
            file: result.rows[0]
        });

    } catch (error) {
        console.error('Error en upload:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};