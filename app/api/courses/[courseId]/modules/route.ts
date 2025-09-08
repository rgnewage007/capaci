import { NextResponse } from 'next/server';
import { CourseModule } from '@/types';

const sampleModules: Record<string, CourseModule[]> = {
    '1': [
        {
            id: '101',
            courseId: '1',
            title: 'Introducción a EPP',
            description: 'Equipo de Protección Personal básico',
            contentType: 'video',
            contentUrl: '/api/placeholder/video',
            duration: 1200,
            orderIndex: 1,
            isPublished: true,
            createdAt: '2024-01-16T10:00:00Z',
            updatedAt: '2024-01-16T10:00:00Z'
        },
        {
            id: '102',
            courseId: '1',
            title: 'Normas OSHA',
            description: 'Estándares de seguridad ocupacional',
            contentType: 'video',
            contentUrl: '/api/placeholder/video',
            duration: 1800,
            orderIndex: 2,
            isPublished: true,
            createdAt: '2024-01-17T10:00:00Z',
            updatedAt: '2024-01-17T10:00:00Z'
        }
    ],
    '2': [
        {
            id: '201',
            courseId: '2',
            title: 'RCP Básico',
            description: 'Reanimación cardiopulmonar',
            contentType: 'video',
            contentUrl: '/api/placeholder/video',
            duration: 1500,
            orderIndex: 1,
            isPublished: true,
            createdAt: '2024-02-02T10:00:00Z',
            updatedAt: '2024-02-02T10:00:00Z'
        }
    ]
};

export async function GET(
    request: Request,
    { params }: { params: { courseId: string } }
) {
    try {
        const { courseId } = params;

        // Simular un retraso de red
        await new Promise(resolve => setTimeout(resolve, 800));

        const modules = sampleModules[courseId] || [];

        return NextResponse.json(modules);
    } catch (error) {
        console.error('Error fetching course modules:', error);
        return NextResponse.json(
            { error: 'Error fetching course modules' },
            { status: 500 }
        );
    }
}