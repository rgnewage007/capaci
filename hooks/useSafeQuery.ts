'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';

interface UseSafeQueryOptions<TData> extends Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'> {
    queryKey: any[];
    enabled?: boolean;
}

export function useSafeQuery<TData>({
    queryKey,
    enabled = true,
    ...options
}: UseSafeQueryOptions<TData>) {
    const queryFn = async () => {
        try {
            const response = await fetch(queryKey[0]);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        } catch (error) {
            console.error('Query error:', error);
            throw error;
        }
    };

    return useQuery({
        ...options,
        queryKey,
        queryFn,
        enabled,
    });
}