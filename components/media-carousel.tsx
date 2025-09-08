// components/media-carousel.tsx
'use client';

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
    ChevronLeft,
    ChevronRight,
    Maximize,
    Minimize,
    ExternalLink,
    CheckCircle2,
    Play,
    Pause,
    Volume2,
    VolumeX
} from "lucide-react";
import QuizComponent from "@/components/quiz/quiz-component";

interface MediaItem {
    id: string;
    type: 'image' | 'video' | 'exam' | 'quiz';
    filename: string;
    title?: string;
    description?: string;
    duration?: number;
    url?: string;
    quizData?: {
        questions: Array<{
            id: string;
            question: string;
            options: string[];
            correctAnswer: number;
            points: number;
        }>;
        timeLimit?: number;
        passingScore: number;
    };
}

interface MediaCarouselProps {
    mediaItems: MediaItem[];
    initialIndex?: number;
    onComplete?: () => void;
    userId: string;
    courseId: string;
}

// Función auxiliar para obtener la URL del archivo protegido
const getProtectedFileUrl = (filename: string) => {
    return `/api/protected-content/${filename}`;
};

export default function MediaCarousel({
    mediaItems,
    initialIndex = 0,
    onComplete,
    userId,
    courseId
}: MediaCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [videoProgress, setVideoProgress] = useState(0);
    const [showQuiz, setShowQuiz] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const currentItem = mediaItems[currentIndex];

    // Función para guardar progreso
    const saveProgress = async (moduleId: string, status: string, timeSpent: number = 0, score: number = 0) => {
        try {
            const response = await fetch('/api/progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    courseId,
                    moduleId,
                    status,
                    timeSpent,
                    score
                }),
            });

            if (!response.ok) {
                throw new Error('Error al guardar el progreso');
            }

            return await response.json();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Navegación
    const nextItem = () => {
        if (currentIndex < mediaItems.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setVideoProgress(0);
            setCurrentTime(0);
            setIsPlaying(false);
        } else if (onComplete) {
            onComplete();
        }
    };

    const prevItem = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setVideoProgress(0);
            setCurrentTime(0);
            setIsPlaying(false);
        }
    };

    // Pantalla completa
    const toggleFullscreen = () => {
        if (!document.fullscreenElement && containerRef.current) {
            containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Controles de video
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

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleSeek = (time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    // Cuando se completa un quiz
    const handleQuizComplete = async (score: number, timeSpent: number) => {
        await saveProgress(currentItem.id, 'completed', timeSpent, score);
        setShowQuiz(false);
        nextItem();
    };

    // Cuando se ve un módulo, guardar progreso
    useEffect(() => {
        if (currentItem.type !== 'quiz' && !showQuiz) {
            saveProgress(currentItem.id, 'viewed');
        }
    }, [currentIndex, currentItem.type, showQuiz]);

    // Para videos: manejar la reproducción y progreso
    useEffect(() => {
        const video = videoRef.current;
        if (!video || currentItem.type !== 'video') return;

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            if (video.duration) {
                setVideoProgress((video.currentTime / video.duration) * 100);
                setDuration(video.duration);
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleEnded = () => {
            setIsPlaying(false);
            setTimeout(nextItem, 1000);
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('ended', handleEnded);
        };
    }, [currentIndex, currentItem.type]);

    // Manejo de eventos de teclado
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowLeft':
                    prevItem();
                    break;
                case 'ArrowRight':
                case ' ':
                    e.preventDefault();
                    if (currentItem.type === 'video') {
                        togglePlayPause();
                    } else {
                        nextItem();
                    }
                    break;
                case 'Escape':
                    if (isFullscreen) toggleFullscreen();
                    break;
                case 'm':
                case 'M':
                    if (currentItem.type === 'video') toggleMute();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentIndex, isFullscreen, currentItem.type, isPlaying]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const renderMedia = () => {
        if (showQuiz && currentItem.type === 'quiz' && currentItem.quizData) {
            return (
                <QuizComponent
                    quiz={{
                        id: currentItem.id,
                        title: currentItem.title || "Quiz",
                        description: currentItem.description || "",
                        questions: currentItem.quizData.questions,
                        timeLimit: currentItem.quizData.timeLimit,
                        passingScore: currentItem.quizData.passingScore
                    }}
                    onComplete={handleQuizComplete}
                    onCancel={() => setShowQuiz(false)}
                />
            );
        }

        switch (currentItem.type) {
            case 'image':
                return (
                    <img
                        src={getProtectedFileUrl(currentItem.filename)}
                        alt={currentItem.title || `Media ${currentIndex + 1}`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
                        }}
                    />
                );

            case 'video':
                return (
                    <div className="relative w-full h-full">
                        <video
                            ref={videoRef}
                            src={getProtectedFileUrl(currentItem.filename)}
                            className="w-full h-full object-contain"
                            controls={false}
                            playsInline
                        />

                        {/* Controles de video personalizados */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                            <div className="flex items-center space-x-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={togglePlayPause}
                                    className="text-white hover:bg-white/20"
                                >
                                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleMute}
                                    className="text-white hover:bg-white/20"
                                >
                                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                </Button>

                                <div className="flex-1">
                                    <Progress
                                        value={videoProgress}
                                        className="h-2"
                                        onClick={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const percent = (e.clientX - rect.left) / rect.width;
                                            handleSeek(percent * duration);
                                        }}
                                    />
                                </div>

                                <span className="text-white text-sm">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </span>
                            </div>
                        </div>
                    </div>
                );

            case 'exam':
                return (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <div className="mb-6">
                            <ExternalLink className="h-16 w-16 text-blue-600 mx-auto" />
                            <h3 className="text-xl font-bold mt-4">{currentItem.title || "Examen Requerido"}</h3>
                            <p className="text-gray-600 mt-2">
                                {currentItem.description || "Debes completar este examen para continuar con el curso."}
                            </p>
                        </div>

                        <Button
                            onClick={() => window.open(currentItem.url || '#', '_blank')}
                            className="mb-4"
                        >
                            <ExternalLink className="mr-2" size={16} />
                            Abrir Examen
                        </Button>

                        <Button
                            variant="outline"
                            onClick={nextItem}
                        >
                            <CheckCircle2 className="mr-2" size={16} />
                            Ya completé el examen
                        </Button>
                    </div>
                );

            case 'quiz':
                return (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <div className="mb-6">
                            <CheckCircle2 className="h-16 w-16 text-blue-600 mx-auto" />
                            <h3 className="text-xl font-bold mt-4">{currentItem.title || "Evaluación"}</h3>
                            <p className="text-gray-600 mt-2">
                                {currentItem.description || "Completa este quiz para continuar."}
                            </p>
                            {currentItem.quizData && (
                                <p className="text-sm text-gray-500 mt-2">
                                    {currentItem.quizData.questions.length} preguntas •
                                    Puntuación mínima: {currentItem.quizData.passingScore}%
                                </p>
                            )}
                        </div>

                        <Button onClick={() => setShowQuiz(true)} className="mb-4">
                            Iniciar Quiz
                        </Button>
                    </div>
                );

            default:
                return (
                    <div className="flex items-center justify-center h-full text-white">
                        <p>Tipo de medio no compatible</p>
                    </div>
                );
        }
    };

    return (
        <div className="relative w-full h-full" ref={containerRef}>
            <Card className="h-full flex flex-col">
                <CardContent className="flex-1 p-0 relative">
                    {/* Contenedor principal del media */}
                    <div className="relative w-full h-full bg-black flex items-center justify-center">
                        {renderMedia()}

                        {/* Controles de navegación (solo mostrar si no es quiz) */}
                        {!showQuiz && (
                            <>
                                <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={prevItem}
                                        disabled={currentIndex === 0}
                                        className="bg-white/20 hover:bg-white/40 text-white h-12 w-12 rounded-full"
                                    >
                                        <ChevronLeft size={24} />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={nextItem}
                                        disabled={currentIndex === mediaItems.length - 1 && !onComplete}
                                        className="bg-white/20 hover:bg-white/40 text-white h-12 w-12 rounded-full"
                                    >
                                        <ChevronRight size={24} />
                                    </Button>
                                </div>

                                {/* Botón de pantalla completa */}
                                <div className="absolute top-4 right-4">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={toggleFullscreen}
                                        className="bg-white/20 hover:bg-white/40 text-white"
                                    >
                                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                                    </Button>
                                </div>

                                {/* Información del media actual */}
                                <div className="absolute bottom-4 left-4 text-white bg-black/50 px-3 py-1 rounded">
                                    {currentIndex + 1} / {mediaItems.length}
                                    {currentItem.title && ` - ${currentItem.title}`}
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>

                {/* Barra de progreso general (solo mostrar si no es quiz) */}
                {!showQuiz && (
                    <div className="p-4 border-t">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Progreso general</span>
                            <span>{Math.round(((currentIndex + 1) / mediaItems.length) * 100)}%</span>
                        </div>
                        <Progress value={((currentIndex + 1) / mediaItems.length) * 100} />

                        {/* Barra de progreso para videos */}
                        {currentItem.type === 'video' && (
                            <>
                                <div className="flex justify-between text-sm text-gray-600 mt-3 mb-2">
                                    <span>Progreso del video</span>
                                    <span>{Math.round(videoProgress)}%</span>
                                </div>
                                <Progress value={videoProgress} className="h-1" />
                            </>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
}