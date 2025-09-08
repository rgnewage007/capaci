'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "@/lib/queryClient";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                    {children}
                    <Toaster />
                </TooltipProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}