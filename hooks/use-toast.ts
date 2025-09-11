'use client';

import { useState, useContext, createContext, ReactNode } from 'react';

interface Toast {
    id: string;
    title: string;
    description?: string;
    variant?: 'default' | 'destructive';
}

interface ToastContextType {
    toasts: Toast[];
    toast: (props: Omit<Toast, 'id'>) => void;
    dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType>({
    toasts: [],
    toast: () => { },
    dismiss: () => { },
});

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = (props: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((currentToasts) => [...currentToasts, { id, ...props }]);

        setTimeout(() => {
            setToasts((currentToasts) => currentToasts.filter((t) => t.id !== id));
        }, 5000);
    };

    const dismiss = (id: string) => {
        setToasts((currentToasts) => currentToasts.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value= {{ toasts, toast, dismiss }
}>
    { children }
    < div className = "fixed top-4 right-4 z-50 space-y-2" >
    {
        toasts.map((toastItem) => (
            <div
            key= { toastItem.id }
            className = {`px-4 py-3 rounded-lg shadow-lg border ${toastItem.variant === 'destructive'
                ? 'bg-red-100 border-red-300 text-red-900'
                : 'bg-white border-gray-200 text-gray-900'
                }`}
        >
        <div className="font-semibold" > { toastItem.title } </div>
{ toastItem.description && <div className="text-sm" > { toastItem.description } </div> }
<button
              onClick={ () => dismiss(toastItem.id) }
className = "absolute top-2 right-2 text-gray-400 hover:text-gray-600"
    >
              ×
</button>
    </div>
        ))}
</div>
    </ToastContext.Provider>
  );
}

export function useToast() {
    return useContext(ToastContext);
}