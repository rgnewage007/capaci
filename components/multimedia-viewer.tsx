'use client';

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Maximize,
    Volume2,
    VolumeX,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    FileText,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CourseModule } from "@/types";

interface MultimediaViewerProps {
    modules: CourseModule[];
    currentModuleIndex: number;
    onModuleChange: (index: number) => void;
    courseId: string;
}

export default function MultimediaViewer({
    modules,
    currentModuleIndex,
    onModuleChange,
    courseId
}: MultimediaViewerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const currentModule = modules[currentModuleIndex];
    const isImage = currentModule?.contentType === 'image';
    const isVideo = currentModule?.contentType === 'video' || currentModule?.contentType === 'mp4';
    const hasExternalQuiz = currentModule?.externalQuizUrl && currentModule?.quizTitle;

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const seek = (time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement && containerRef.current) {
            containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const nextModule = () => {
        if (currentModuleIndex < modules.length - 1) {
            onModuleChange(currentModuleIndex + 1);
        }
    };

    const prevModule = () => {
        if (currentModuleIndex > 0) {
            onModuleChange(currentModuleIndex - 1);
        }
    };

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowLeft':
                    prevModule();
                    break;
                case 'ArrowRight':
                    nextModule();
                    break;
                case ' ':
                    e.preventDefault();
                    if (isVideo) togglePlayPause();
                    break;
                case 'Escape':
                    if (isFullscreen) toggleFullscreen();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentModuleIndex, modules.length, isVideo, isPlaying, isFullscreen]);

    if (!currentModule) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
                <p className="text-gray-500">No hay módulos disponibles</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <Button
                            variant="outline"
                            onClick={prevModule}
                            disabled={currentModuleIndex === 0}
                            className="flex items-center space-x-2"
                        >
                            <ChevronLeft size={16} />
                            <span>Anterior</span>
                        </Button>

                        <div className="text-center">
                            <h2 className="text-lg font-semibold">{currentModule.title}</h2>
                            <p className="text-sm text-gray-600">
                                {currentModuleIndex + 1} de {modules.length} módulos
                            </p>
                        </div>

                        <Button
                            variant="outline"
                            onClick={nextModule}
                            disabled={currentModuleIndex === modules.length - 1}
                            className="flex items-center space-x-2"
                        >
                            <span>Siguiente</span>
                            <ChevronRight size={16} />
                        </Button>
                    </div>

                    <div ref={containerRef} className="relative bg-black rounded-lg overflow-hidden mb-4 aspect-video">
                        {isImage ? (
                            <img
                                src={currentModule.contentUrl || "/placeholder-image.jpg"}
                                alt={currentModule.title}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
                                }}
                            />
                        ) : isVideo ? (
                            <video
                                ref={videoRef}
                                src={currentModule.contentUrl}
                                className="w-full h-full object-contain"
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                onEnded={() => setIsPlaying(false)}
                                onClick={togglePlayPause}
                                controls={currentModule.contentType === 'mp4'}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-white">
                                <p className="text-lg">Tipo de contenido no soportado</p>
                            </div>
                        )}
                    </div>

                    {isVideo && currentModule.contentType !== 'mp4' && (
                        <div className="bg-gray-900 text-white p-3 rounded-lg mb-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => seek(Math.max(0, currentTime - 10))}
                                        className="text-white hover:bg-gray-800 h-8 w-8"
                                    >
                                        <SkipBack size={16} />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={togglePlayPause}
                                        className="text-white hover:bg-gray-800 h-10 w-10"
                                    >
                                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => seek(Math.min(duration, currentTime + 10))}
                                        className="text-white hover:bg-gray-800 h-8 w-8"
                                    >
                                        <SkipForward size={16} />
                                    </Button>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={toggleMute}
                                        className="text-white hover:bg-gray-800 h-8 w-8"
                                    >
                                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={toggleFullscreen}
                                        className="text-white hover:bg-gray-800 h-8 w-8"
                                    >
                                        <Maximize size={16} />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <span className="text-xs font-mono">{formatTime(currentTime)}</span>
                                <Progress
                                    value={(currentTime / duration) * 100}
                                    className="flex-1 h-2"
                                />
                                <span className="text-xs font-mono">{formatTime(duration)}</span>
                            </div>
                        </div>
                    )}

                    {hasExternalQuiz && (
                        <Card className="border-blue-200 bg-blue-50 mb-4">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3">
                                        <FileText className="text-blue-600 mt-0.5" size={18} />
                                        <div>
                                            <h4 className="font-medium text-blue-900">{currentModule.quizTitle}</h4>
                                            <p className="text-sm text-blue-700 mt-1">
                                                Complete este cuestionario externo para continuar con el curso.
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                        <FileText className="mr-1" size={12} />
                                        Cuestionario
                                    </Badge>
                                </div>

                                <div className="flex items-center space-x-2 mt-3">
                                    <Button
                                        onClick={() => window.open(currentModule.externalQuizUrl, '_blank')}
                                        className="bg-blue-600 hover:bg-blue-700 text-xs h-8"
                                    >
                                        <ExternalLink className="mr-1" size={14} />
                                        Abrir Cuestionario
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="text-xs h-8"
                                    >
                                        <CheckCircle2 className="mr-1" size={14} />
                                        Marcar como Completado
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">{currentModule.title}</h3>
                                <p className="text-sm text-gray-600">
                                    Módulo {currentModuleIndex + 1} de {modules.length}
                                </p>
                                {currentModule.duration && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        Duración: {Math.ceil(currentModule.duration / 60)} minutos
                                    </p>
                                )}
                            </div>
                            <Badge variant="outline" className="capitalize">
                                {currentModule.contentType}
                            </Badge>
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Progreso del curso</span>
                            <span>{Math.round(((currentModuleIndex + 1) / modules.length) * 100)}%</span>
                        </div>
                        <Progress value={((currentModuleIndex + 1) / modules.length) * 100} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}