// components/course-player.tsx
'use client';

import { useState } from "react";
import { useSafeQuery } from "@/hooks/useSafeQuery";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, ChevronLeft, ChevronRight, CheckCircle, Lock, Clock } from "lucide-react";

interface CoursePlayerProps {
    courseId: string;
    initialModuleId?: string;
}

export default function CoursePlayer({ courseId, initialModuleId }: CoursePlayerProps) {
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const { data: course } = useSafeQuery({
        queryKey: ['/api/courses', courseId],
    });

    const { data: modules, isLoading } = useSafeQuery({
        queryKey: ['/api/courses', courseId, 'modules'],
    });

    const { data: userProgress } = useSafeQuery({
        queryKey: ['/api/user-progress', courseId],
    });

    const currentModule = modules?.[currentModuleIndex];

    const handleModuleComplete = async () => {
        try {
            await fetch('/api/user-progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    moduleId: currentModule?.id,
                    courseId,
                    status: 'completed',
                    timeSpent: Math.floor((Date.now() - startTime) / 1000),
                }),
            });
        } catch (error) {
            console.error('Error marking module as complete:', error);
        }
    };

    const navigateToModule = (index: number) => {
        if (index >= 0 && index < (modules?.length || 0)) {
            setCurrentModuleIndex(index);
            setIsPlaying(false);
            setCurrentTime(0);
        }
    };

    const renderMediaPlayer = () => {
        if (!currentModule?.media) {
            return (
                <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                    <div className="text-center">
                        <p className="text-gray-600">Contenido no disponible</p>
                        <p className="text-sm text-gray-500">Este módulo no tiene contenido multimedia</p>
                    </div>
                </div>
            );
        }

        switch (currentModule.media.file_type.split('/')[0]) {
            case 'video':
                return (
                    <div className="relative bg-black rounded-lg overflow-hidden">
                        <video
                            className="w-full h-auto"
                            controls
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                        >
                            <source src={`/uploads/${currentModule.media.filename}`} type={currentModule.media.file_type} />
                            Tu navegador no soporta el elemento de video.
                        </video>

                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                            <div className="flex items-center space-x-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="text-white hover:bg-white/20"
                                >
                                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                </Button>

                                <div className="flex-1">
                                    <Progress
                                        value={(currentTime / duration) * 100}
                                        className="h-2"
                                    />
                                </div>

                                <span className="text-white text-sm">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </span>
                            </div>
                        </div>
                    </div>
                );

            case 'image':
                return (
                    <div className="flex justify-center">
                        <img
                            src={`/uploads/${currentModule.media.filename}`}
                            alt={currentModule.title}
                            className="max-w-full h-auto rounded-lg shadow-lg"
                        />
                    </div>
                );

            default:
                return (
                    <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                        <div className="text-center">
                            <p className="text-gray-600">Tipo de contenido no compatible</p>
                            <Button variant="outline" className="mt-2">
                                <Download className="mr-2" size={16} />
                                Descargar Archivo
                            </Button>
                        </div>
                    </div>
                );
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando contenido del curso...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Panel de contenido principal */}
            <div className="lg:col-span-3 space-y-6">
                {/* Media Player */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">{currentModule?.title}</h1>
                    {renderMediaPlayer()}
                </div>

                {/* Descripción y contenido */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Acerca de este módulo</h2>
                    <p className="text-gray-700 mb-4">{currentModule?.content_text}</p>

                    {currentModule?.duration && (
                        <div className="flex items-center text-sm text-gray-600">
                            <Clock className="mr-2" size={16} />
                            <span>Duración aproximada: {Math.ceil(currentModule.duration / 60)} minutos</span>
                        </div>
                    )}
                </div>

                {/* Navegación */}
                <div className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={() => navigateToModule(currentModuleIndex - 1)}
                        disabled={currentModuleIndex === 0}
                    >
                        <ChevronLeft className="mr-2" size={16} />
                        Módulo Anterior
                    </Button>

                    <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={handleModuleComplete}
                    >
                        <CheckCircle className="mr-2" size={16} />
                        Marcar como Completado
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => navigateToModule(currentModuleIndex + 1)}
                        disabled={currentModuleIndex === (modules?.length || 0) - 1}
                    >
                        Siguiente Módulo
                        <ChevronRight className="ml-2" size={16} />
                    </Button>
                </div>
            </div>

            {/* Sidebar - Lista de módulos */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-semibold mb-4">Módulos del Curso</h3>

                    <div className="space-y-2">
                        {modules?.map((module: any, index: number) => {
                            const isCurrent = index === currentModuleIndex;
                            const progress = userProgress?.modules?.find((m: any) => m.moduleId === module.id);
                            const isCompleted = progress?.status === 'completed';

                            return (
                                <button
                                    key={module.id}
                                    onClick={() => navigateToModule(index)}
                                    className={`w-full text-left p-3 rounded-lg transition-colors ${isCurrent
                                            ? 'bg-blue-100 border-2 border-blue-500'
                                            : isCompleted
                                                ? 'bg-green-50 border border-green-200'
                                                : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isCompleted
                                                    ? 'bg-green-500 text-white'
                                                    : isCurrent
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-gray-300 text-gray-600'
                                                }`}>
                                                {isCompleted ? '✓' : index + 1}
                                            </div>
                                            <span className="text-sm font-medium">{module.title}</span>
                                        </div>

                                        {module.duration && (
                                            <span className="text-xs text-gray-500">
                                                {Math.ceil(module.duration / 60)}min
                                            </span>
                                        )}
                                    </div>

                                    {progress && (
                                        <Progress
                                            value={progress.percentage || 0}
                                            className="h-1 mt-2"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Progress Overview */}
                <div className="bg-white rounded-lg shadow p-6 mt-4">
                    <h3 className="font-semibold mb-4">Progreso del Curso</h3>

                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span>Módulos completados</span>
                            <span className="font-medium">
                                {userProgress?.completedModules || 0} / {modules?.length || 0}
                            </span>
                        </div>

                        <Progress
                            value={((userProgress?.completedModules || 0) / (modules?.length || 1)) * 100}
                            className="h-2"
                        />

                        <div className="flex justify-between text-sm">
                            <span>Tiempo total</span>
                            <span className="font-medium">
                                {Math.floor((userProgress?.totalTimeSpent || 0) / 60)} minutos
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}