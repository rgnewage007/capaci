'use client';

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Home, BookOpen, Lock, CheckCircle, Play, Eye, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast-simple";
import api from "@/lib/axios-auth";

interface MediaItem {
    id: string;
    type: 'image' | 'video' | 'exam' | 'text';
    filename: string;
    title: string;
    description: string;
    duration?: number;
    url?: string;
    isUnlocked: boolean;
    isCompleted: boolean;
}

interface CourseData {
    id: string;
    title: string;
    description: string;
    totalModules: number;
    completedModules: number;
    mediaItems: MediaItem[];
}

export default function CoursePresentationPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const courseId = params.courseId as string;

    const [course, setCourse] = useState<CourseData | null>(null);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isCompleting, setIsCompleting] = useState(false);
    const [courseCompleted, setCourseCompleted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getAuthToken = () => {
        if (typeof window === 'undefined') return null;
        try {
            return localStorage.getItem('authToken');
        } catch (error) {
            return null;
        }
    };

    const fetchCourseData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const token = getAuthToken();

            if (!token) {
                toast("Error de autenticación", "Por favor, inicia sesión nuevamente", "destructive");
                router.push('/login');
                return;
            }

            const response = await api.get(`/courses/${courseId}/presentation`);
            const courseData = response.data;
            
            setCourse(courseData);

            // Encontrar el primer módulo no completado
            const firstIncompleteIndex = courseData.mediaItems.findIndex(
                (item: MediaItem) => !item.isCompleted && item.isUnlocked
            );
            
            if (firstIncompleteIndex !== -1) {
                setCurrentMediaIndex(firstIncompleteIndex);
            }

            // Verificar si el curso está completado
            if (courseData.completedModules === courseData.totalModules) {
                setCourseCompleted(true);
            }

        } catch (error: any) {
            console.error('Error fetching course data:', error);
            // ... (manejo de errores existente)
        } finally {
            setIsLoading(false);
        }
    }, [courseId, router, toast]);

    useEffect(() => {
        if (courseId) {
            fetchCourseData();
        }
    }, [courseId]);

    const handleCompleteModule = async (moduleId: string) => {
        try {
            setIsCompleting(true);
            const token = getAuthToken();
            
            if (!token) {
                toast("Error de autenticación", "Por favor, inicia sesión nuevamente", "destructive");
                router.push('/login');
                return;
            }

            // Llamar a la API para marcar como completado
            await api.post(`/progress`, {
                moduleId: moduleId,
                courseId: courseId,
                status: 'completed'
            });

            // Actualizar el estado local inmediatamente
            setCourse(prev => {
                if (!prev) return null;

                const updatedMediaItems = prev.mediaItems.map(item =>
                    item.id === moduleId ? { ...item, isCompleted: true } : item
                );

                const completedCount = updatedMediaItems.filter(item => item.isCompleted).length;

                // Verificar si todos los módulos están completados
                if (completedCount === prev.totalModules) {
                    setCourseCompleted(true);
                }

                return {
                    ...prev,
                    mediaItems: updatedMediaItems,
                    completedModules: completedCount
                };
            });

            toast("Módulo completado", "Has completado este módulo exitosamente");

            // Avanzar automáticamente al siguiente módulo después de 1 segundo
            setTimeout(() => {
                if (course && currentMediaIndex < course.mediaItems.length - 1) {
                    setCurrentMediaIndex(currentMediaIndex + 1);
                } else if (course && course.completedModules === course.totalModules - 1) {
                    // Último módulo completado
                    setCourseCompleted(true);
                }
            }, 1000);

        } catch (error: any) {
            console.error('Error completing module:', error);
            // ... (manejo de errores existente)
        } finally {
            setIsCompleting(false);
        }
    };

    const handleCompleteCourse = async () => {
        try {
            setIsCompleting(true);
            const token = getAuthToken();
            
            if (!token) {
                toast("Error de autenticación", "Por favor, inicia sesión nuevamente", "destructive");
                router.push('/login');
                return;
            }

            await api.post(`/courses/${courseId}/complete`, {});

            setCourseCompleted(true);
            toast("¡Curso Completado!", "Has finalizado el curso exitosamente");

            setTimeout(() => {
                router.push('/courses');
            }, 2000);

        } catch (error: any) {
            console.error('Error completing course:', error);
            // ... (manejo de errores existente)
        } finally {
            setIsCompleting(false);
        }
    };

    const handleNext = () => {
        if (course && currentMediaIndex < course.mediaItems.length - 1) {
            setCurrentMediaIndex(currentMediaIndex + 1);
        } else if (course && course.completedModules === course.totalModules) {
            handleCompleteCourse();
        }
    };

    const handlePrevious = () => {
        if (currentMediaIndex > 0) {
            setCurrentMediaIndex(currentMediaIndex - 1);
        }
    };

    const currentMedia = course?.mediaItems[currentMediaIndex];

    // Calcular porcentaje de progreso
    const progressPercentage = course 
        ? Math.round((course.completedModules / course.totalModules) * 100)
        : 0;



    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <Loader2 className="animate-spin mx-auto mb-4" size={32} />
                    <p>Cargando contenido del curso...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <AlertCircle className="mx-auto mb-4" size={48} />
                    <h2 className="text-xl font-bold mb-2">Error</h2>
                    <p className="mb-4">{error}</p>
                    <Button onClick={() => router.push('/courses')} className="mt-4">
                        Volver a Cursos
                    </Button>
                </div>
            </div>
        );
    }

    if (courseCompleted) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                            <BookOpen className="text-green-600" size={32} />
                        </div>
                        <CardTitle className="text-2xl">¡Curso Completado!</CardTitle>
                        <CardDescription>
                            Has finalizado el curso de {course?.title} exitosamente.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-gray-600">
                            Felicitaciones por completar todos los módulos del curso.
                            Puedes revisar tus certificados en tu perfil.
                        </p>
                        <div className="flex flex-col space-y-2">
                            <Button onClick={() => router.push('/courses')} className="w-full">
                                Volver a Mis Cursos
                            </Button>
                            <Button onClick={() => router.push('/')} variant="outline" className="w-full">
                                <Home className="mr-2" size={16} />
                                Ir al Inicio
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!course || !currentMedia) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <AlertCircle className="mx-auto mb-4" size={48} />
                    <h2 className="text-xl font-bold mb-2">Curso no encontrado</h2>
                    <p>El curso que buscas no existe o no tienes acceso.</p>
                    <Button onClick={() => router.push('/courses')} className="mt-4">
                        Volver a Cursos
                    </Button>
                </div>
            </div>
        );
    }

   return (
        <div className="min-h-screen bg-gray-900">
            <div className="container mx-auto px-4 py-4">
                {/* Header con Progress Bar */}
                <div className="flex items-center justify-between mb-4">
                    <Button
                        onClick={() => router.back()}
                        variant="ghost"
                        className="text-white hover:bg-white/10"
                    >
                        <ArrowLeft className="mr-2" size={16} />
                        Volver
                    </Button>

                    <div className="text-center text-white">
                        <h1 className="text-xl font-bold">{course?.title}</h1>
                        <p className="text-sm text-gray-300">{course?.description}</p>
                        <div className="flex items-center justify-center mt-2">
                            <Progress
                                value={progressPercentage}
                                className="w-64 mr-4"
                            />
                            <span className="text-sm">{progressPercentage}%</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            {course?.completedModules} de {course?.totalModules} módulos completados
                        </p>
                    </div>

                    <Button
                        onClick={() => router.push('/courses')}
                        variant="ghost"
                        className="text-white hover:bg-white/10"
                    >
                        <Home className="mr-2" size={16} />
                        Cursos
                    </Button>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Media Viewer */}
                    <div className="lg:col-span-3">
                        <Card className="bg-gray-800 border-gray-700">
                            <CardHeader className="text-white">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{currentMedia?.title}</CardTitle>
                                        <CardDescription className="text-gray-300">
                                            {currentMedia?.description}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-400">
                                        <span>Módulo {currentMediaIndex + 1} de {course?.mediaItems.length}</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {renderMediaContent(currentMedia)}

                                <div className="flex justify-between items-center mt-6">
                                    <Button
                                        onClick={handlePrevious}
                                        disabled={currentMediaIndex === 0}
                                        variant="outline"
                                        className="text-white border-gray-600"
                                    >
                                        Anterior
                                    </Button>

                                    {!currentMedia?.isCompleted && currentMedia?.isUnlocked && (
                                        <Button
                                            onClick={() => handleCompleteModule(currentMedia.id)}
                                            disabled={isCompleting}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            {isCompleting ? (
                                                <Loader2 className="mr-2 animate-spin" size={16} />
                                            ) : (
                                                <CheckCircle className="mr-2" size={16} />
                                            )}
                                            Marcar como Completado
                                        </Button>
                                    )}

                                    {currentMedia?.isCompleted && (
                                        <div className="flex items-center text-green-400">
                                            <CheckCircle className="mr-2" size={16} />
                                            <span>Completado</span>
                                        </div>
                                    )}

                                    <Button
                                        onClick={handleNext}
                                        disabled={currentMediaIndex === course?.mediaItems.length - 1 && !currentMedia?.isCompleted}
                                        variant="outline"
                                        className="text-white border-gray-600"
                                    >
                                        {currentMediaIndex === course?.mediaItems.length - 1 ? 'Finalizar' : 'Siguiente'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - Module List */}
                    <div className="lg:col-span-1">
                        <Card className="bg-gray-800 border-gray-700">
                            <CardHeader className="text-white">
                                <CardTitle>Módulos del Curso</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {course?.mediaItems.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className={`p-3 rounded-lg cursor-pointer transition-colors ${index === currentMediaIndex
                                                ? 'bg-blue-600 text-white'
                                                : item.isUnlocked
                                                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                                                    : 'bg-gray-900 text-gray-400'
                                                }`}
                                            onClick={() => item.isUnlocked && setCurrentMediaIndex(index)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    {item.isCompleted ? (
                                                        <CheckCircle className="text-green-400" size={16} />
                                                    ) : item.isUnlocked ? (
                                                        <Play className="text-blue-400" size={16} />
                                                    ) : (
                                                        <Lock size={16} />
                                                    )}
                                                    <span className="text-sm truncate">{item.title}</span>
                                                </div>
                                                <div className="text-xs">
                                                    {item.type === 'video' && '🎬'}
                                                    {item.type === 'image' && '🖼️'}
                                                    {item.type === 'exam' && '📝'}
                                                    {item.type === 'text' && '📄'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {course?.completedModules === course?.totalModules && (
                                    <Button
                                        onClick={handleCompleteCourse}
                                        disabled={isCompleting}
                                        className="w-full mt-4 bg-green-600 hover:bg-green-700"
                                    >
                                        {isCompleting ? (
                                            <Loader2 className="mr-2 animate-spin" size={16} />
                                        ) : (
                                            <CheckCircle className="mr-2" size={16} />
                                        )}
                                        Completar Curso
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );

}

function renderMediaContent(media: MediaItem) {
    const getProtectedContentUrl = (filename: string) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        return `/api/protected-content/${filename}${token ? `?token=${token}` : ''}`;
    };

    switch (media.type) {
        case 'image':
            return (
                <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                    <img
                        src={getProtectedContentUrl(media.filename)}
                        alt={media.title}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/api/placeholder/800/450';
                        }}
                    />
                </div>
            );

        case 'video':
            return (
                <div className="aspect-video bg-black rounded-lg">
                    <video
                        controls
                        className="w-full h-full"
                        poster={media.filename ? getProtectedContentUrl(`thumbnails/${media.filename}.jpg`) : undefined}
                    >
                        <source src={getProtectedContentUrl(media.filename)} type="video/mp4" />
                        Tu navegador no soporta el elemento de video.
                    </video>
                </div>
            );

        case 'exam':
            return (
                <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center flex-col p-6">
                    <Eye className="text-yellow-400 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-white mb-2">Evaluación</h3>
                    <p className="text-gray-300 text-center mb-4">
                        Esta sección contiene una evaluación para medir tu comprensión del material.
                    </p>
                    <Button asChild>
                        <a 
                            href={media.url ? `${media.url}${media.url.includes('?') ? '&' : '?'}token=${localStorage.getItem('authToken')}` : '#'}
                            target="_blank" 
                            rel="noopener noreferrer"
                        >
                            Iniciar Evaluación
                        </a>
                    </Button>
                </div>
            );

        case 'text':
            return (
                <div className="bg-gray-700 rounded-lg p-6">
                    <div className="prose prose-invert max-w-none">
                        <h3 className="text-white">{media.title}</h3>
                        <p className="text-gray-300">{media.description}</p>
                        <div className="mt-4 p-4 bg-gray-600 rounded">
                            <p className="text-white">
                                Este contenido está disponible para lectura. Por favor, tómate tu tiempo
                                para estudiar el material cuidadosamente.
                            </p>
                        </div>
                    </div>
                </div>
            );

        default:
            return (
                <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
                    <p className="text-white">Tipo de contenido no soportado</p>
                </div>
            );
    }
}