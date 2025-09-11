'use client';

import { useToast } from '@/hooks/use-toast-simple';

export function ToastContainer() {
    const { toasts, dismiss } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`px-4 py-3 rounded-lg shadow-lg border min-w-80 ${toast.variant === 'destructive'
                            ? 'bg-red-100 border-red-300 text-red-900'
                            : 'bg-white border-gray-200 text-gray-900'
                        }`}
                >
                    <div className="font-semibold">{toast.title}</div>
                    {toast.description && (
                        <div className="text-sm mt-1">{toast.description}</div>
                    )}
                    <button
                        onClick={() => dismiss(toast.id)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}