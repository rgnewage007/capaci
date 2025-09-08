import { Course, CourseModule } from '@/types';

export const mockCourses: Course[] = [
    {
        id: '1',
        title: 'Seguridad Industrial',
        description: 'Curso completo sobre normas de seguridad en el entorno industrial. Aprende sobre EPP, normas OSHA y protocolos de seguridad.',
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
        description: 'Aprende técnicas básicas de primeros auxilios para emergencias. RCP, vendajes, y manejo de situaciones críticas.',
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
        description: 'Técnicas de conducción segura y preventiva. Reduce accidentes y mejora tu seguridad al volante.',
        instructorId: '2',
        duration: 300,
        isActive: true,
        category: 'Conducción',
        level: 'intermediate',
        thumbnailUrl: '/api/placeholder/300/200',
        createdAt: '2024-02-15T11:30:00Z',
        updatedAt: '2024-02-25T16:45:00Z'
    },
    {
        id: '4',
        title: 'Prevención de Incendios',
        description: 'Protocolos y técnicas para prevenir y combatir incendios en el ámbito laboral.',
        instructorId: '2',
        duration: 120,
        isActive: true,
        category: 'Seguridad',
        level: 'beginner',
        thumbnailUrl: '/api/placeholder/300/200',
        createdAt: '2024-03-01T08:00:00Z',
        updatedAt: '2024-03-10T12:00:00Z'
    }
];

export const mockModules: Record<string, CourseModule[]> = {
    '1': [
        {
            id: '101',
            courseId: '1',
            title: 'Introducción a EPP',
            description: 'Equipo de Protección Personal básico y su importancia',
            contentType: 'video',
            contentUrl: 'https://example.com/video1.mp4',
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
            description: 'Estándares de seguridad ocupacional y su aplicación',
            contentType: 'video',
            contentUrl: 'https://example.com/video2.mp4',
            duration: 1800,
            orderIndex: 2,
            isPublished: true,
            createdAt: '2024-01-17T10:00:00Z',
            updatedAt: '2024-01-17T10:00:00Z'
        },
        {
            id: '103',
            courseId: '1',
            title: 'Señalización de Seguridad',
            description: 'Tipos de señalización y su significado',
            contentType: 'image',
            contentUrl: 'https://example.com/image1.jpg',
            duration: 600,
            orderIndex: 3,
            isPublished: true,
            createdAt: '2024-01-18T10:00:00Z',
            updatedAt: '2024-01-18T10:00:00Z'
        }
    ],
    '2': [
        {
            id: '201',
            courseId: '2',
            title: 'RCP Básico',
            description: 'Reanimación cardiopulmonar para adultos',
            contentType: 'video',
            contentUrl: 'https://example.com/video3.mp4',
            duration: 1500,
            orderIndex: 1,
            isPublished: true,
            createdAt: '2024-02-02T10:00:00Z',
            updatedAt: '2024-02-02T10:00:00Z'
        },
        {
            id: '202',
            courseId: '2',
            title: 'Manejo de Heridas',
            description: 'Técnicas básicas para el tratamiento de heridas',
            contentType: 'video',
            contentUrl: 'https://example.com/video4.mp4',
            duration: 1200,
            orderIndex: 2,
            isPublished: true,
            createdAt: '2024-02-03T10:00:00Z',
            updatedAt: '2024-02-03T10:00:00Z'
        }
    ],
    '3': [
        {
            id: '301',
            courseId: '3',
            title: 'Principios de Conducción Defensiva',
            description: 'Fundamentos de la conducción preventiva',
            contentType: 'video',
            contentUrl: 'https://example.com/video5.mp4',
            duration: 2400,
            orderIndex: 1,
            isPublished: true,
            createdAt: '2024-02-16T10:00:00Z',
            updatedAt: '2024-02-16T10:00:00Z'
        }
    ],
    '4': [
        {
            id: '401',
            courseId: '4',
            title: 'Tipos de Extintores',
            description: 'Clasificación y uso correcto de extintores',
            contentType: 'video',
            contentUrl: 'https://example.com/video6.mp4',
            duration: 1800,
            orderIndex: 1,
            isPublished: true,
            createdAt: '2024-03-02T10:00:00Z',
            updatedAt: '2024-03-02T10:00:00Z'
        }
    ]
};