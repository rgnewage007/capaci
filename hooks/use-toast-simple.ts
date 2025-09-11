'use client';

import { useState } from 'react';

export function useToast() {
    const [toasts, setToasts] = useState<Array<{
        id: string;
        title: string;
        description?: string;
        variant?: 'default' | 'destructive';
    }>>([]);

    const toast = (title: string, description?: string, variant: 'default' | 'destructive' = 'default') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((current) => [...current, { id, title, description, variant }]);

        setTimeout(() => {
            setToasts((current) => current.filter((t) => t.id !== id));
        }, 5000);
    };

    const dismiss = (id: string) => {
        setToasts((current) => current.filter((t) => t.id !== id));
    };

    return { toasts, toast, dismiss };
}