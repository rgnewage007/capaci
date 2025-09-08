'use client';

import { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({ error, errorInfo });
        console.error('Error Boundary caught:', error, errorInfo);

        // Puedes enviar el error a un servicio de monitoreo aquí
        // logErrorToService(error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    private handleReload = () => {
        window.location.reload();
    };

    private handleGoHome = () => {
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            // Si se proporciona un fallback personalizado, usarlo
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                <AlertCircle className="h-12 w-12 text-red-500" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-red-600">
                                Error Inesperado
                            </CardTitle>
                            <CardDescription>
                                Ocurrió un problema inesperado en la aplicación
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <Alert variant="destructive">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription className="break-words">
                                    {this.state.error?.message || 'Error desconocido'}
                                </AlertDescription>
                            </Alert>

                            {this.state.errorInfo && (
                                <div className="text-sm text-gray-600">
                                    <p className="font-medium">Detalles técnicos:</p>
                                    <pre className="mt-2 p-3 bg-gray-100 rounded-md text-xs overflow-auto max-h-32">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="flex flex-col space-y-3">
                            <div className="flex space-x-3 w-full">
                                <Button
                                    onClick={this.handleReset}
                                    variant="outline"
                                    className="flex-1"
                                    disabled={!this.state.error}
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Reintentar
                                </Button>

                                <Button
                                    onClick={this.handleReload}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Recargar Página
                                </Button>
                            </div>

                            <Button
                                onClick={this.handleGoHome}
                                variant="ghost"
                                className="w-full"
                            >
                                <Home className="mr-2 h-4 w-4" />
                                Volver al Inicio
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;