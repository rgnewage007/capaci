import { QueryClient } from '@tanstack/react-query';
import { safeSerialize } from './serializer';

// Crea una nueva instancia de QueryClient
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
            retry: 1,
            // Asegura que los datos se serialicen correctamente
            structuralSharing: false,
        },
    },
});

// Función para resetear el queryClient (útil para testing)
export function resetQueryClient() {
    queryClient.clear();
}

export async function apiRequest(
    method: string,
    url: string,
    data?: any
): Promise<Response> {
    try {
        const serializedData = data ? safeSerialize(data) : undefined;

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: serializedData ? JSON.stringify(serializedData) : undefined,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        return safeSerialize(responseData);
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}