'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { safeSerialize } from '@/lib/serializer';
import { mockCourses, mockModules } from '@/lib/mockData';

// Función para simular delay de API
const simulateApiDelay = (ms: number = 800) =>
    new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
const mockApi = {
    getCourses: async () => {
        await simulateApiDelay(1000);
        return mockCourses;
    },
    getCourse: async (courseId: string) => {
        await simulateApiDelay(800);
        return mockCourses.find(course => course.id === courseId) || null;
    },
    getCourseModules: async (courseId: string) => {
        await simulateApiDelay(600);
        return mockModules[courseId] || [];
    }
};

export function useSafeQuery<TData = any, TError = any>(
    options: UseQueryOptions<TData, TError> & {
        queryKey: any[]
    }
) {
    // Siempre usar mock data por ahora
    const queryFn = async () => {
        const [path, id, subpath] = options.queryKey;

        if (path === '/api/courses') {
            if (id && subpath === 'modules') {
                return mockApi.getCourseModules(id) as TData;
            } else if (id) {
                return mockApi.getCourse(id) as TData;
            } else {
                return mockApi.getCourses() as TData;
            }
        }

        // Para otras rutas, devolver datos vacíos
        await simulateApiDelay(500);
        return [] as TData;
    };

    return useQuery({
        ...options,
        queryFn,
        select: (data: TData) => {
            const selectedData = options.select ? options.select(data) : data;
            return safeSerialize(selectedData);
        },
        onError: (error) => {
            console.error('Query error:', error);
            if (options.onError) {
                options.onError(error);
            }
        },
        retry: false // No reintentar
    });
}