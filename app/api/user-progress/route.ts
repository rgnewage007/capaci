// app/api/user-progress/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { moduleId, courseId, status, timeSpent } = body;

        // Aquí iría la lógica para guardar en la base de datos
        // Simulamos una respuesta exitosa
        return NextResponse.json({
            success: true,
            message: 'Progreso guardado exitosamente',
            data: {
                moduleId,
                courseId,
                status,
                timeSpent,
                completedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        return NextResponse.json(
            { error: 'Error al guardar el progreso' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    // Simular datos de progreso (en producción vendrían de la base de datos)
    const mockProgress = {
        courseId,
        completedModules: 2,
        totalModules: 5,
        totalTimeSpent: 3540, // segundos
        modules: [
            { moduleId: 'mod1', status: 'completed', percentage: 100 },
            { moduleId: 'mod2', status: 'completed', percentage: 100 },
            { moduleId: 'mod3', status: 'in-progress', percentage: 45 },
            { moduleId: 'mod4', status: 'not-started', percentage: 0 },
            { moduleId: 'mod5', status: 'not-started', percentage: 0 }
        ]
    };

    return NextResponse.json(mockProgress);
}