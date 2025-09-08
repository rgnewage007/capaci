import { NextResponse } from 'next/server';
import { Course } from '@/types';

// Datos de ejemplo para cursos
const sampleCourses: Course[] = [
    {
        id: '1',
        title: 'Seguridad Industrial',
        description: 'Curso completo sobre normas de seguridad en el entorno industrial',
        instructorId: '2',
        duration: 240,
        isActive: true,
        category: 'Seguridad',
        level: 'intermediate',
        thumbnailUrl: '/api/placeholder/300/200',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T15:30:00Z'
    },
    {
        id: '2',
        title: 'Primeros Auxilios',
        description: 'Aprende técnicas básicas de primeros auxilios para emergencias',
        instructorId: '2',
        duration: 180,
        isActive: true,
        category: 'Salud',
        level: 'beginner',
        thumbnailUrl: '/api/placeholder/300/200',
        createdAt: '2024-02-01T09:15:00Z',
        updatedAt: '2024-02-10T14:20:00Z'
    },
    {
        id: '3',
        title: 'Manejo Defensivo',
        description: 'Técnicas de conducción segura y preventiva',
        instructorId: '2',
        duration: 300,
        isActive: true,
        category: 'Conducción',
        level: 'intermediate',
        thumbnailUrl: '/api/placeholder/300/200',
        createdAt: '2024-02-15T11:30:00Z',
        updatedAt: '2024-02-25T16:45:00Z'
    }
];

export async function GET() {
    try {
        // Simular un retraso de red
        await new Promise(resolve => setTimeout(resolve, 1000));

        return NextResponse.json(sampleCourses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        return NextResponse.json(
            { error: 'Error fetching courses' },
            { status: 500 }
        );
    }
}