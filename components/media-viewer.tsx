'use client';

import { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface MediaViewerProps {
    media: any;
    autoPlay?: boolean;
    controls?: boolean;
    className?: string;
}

export default function MediaViewer({ media, autoPlay = false, controls = true, className = '' }: MediaViewerProps) {
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    if (!media) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
                <p className="text-gray-500">No hay contenido multimedia</p>
            </div>
        );
    }

    const isVideo = media.file_type?.startsWith('video');
    const isImage = media.file_type?.startsWith('image');

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = media.file_path;
        link.download = media.original_filename || media.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isImage) {
        return (
            <Card className={className}>
                <CardContent className="p-0">
                    <div className="relative">
                        <img
                            src={media.file_path}
                            alt={media.title}
                            className="w-full h-auto rounded-lg"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                            }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                            <h3 className="font-semibold">{media.title}</h3>
                            {media.description && (
                                <p className="text-sm opacity-90">{media.description}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (isVideo) {
        return (
            <Card className={className}>
                <CardContent className="p-0">
                    <div className="relative group">
                        <video
                            src={media.file_path}
                            className="w-full h-auto rounded-lg"
                            controls={controls}
                            autoPlay={autoPlay}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                        />

                        {!controls && (
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
                                    onClick={handlePlayPause}
                                >
                                    {isPlaying ? (
                                        <Pause className="h-8 w-8" />
                                    ) : (
                                        <Play className="h-8 w-8" />
                                    )}
                                </Button>
                            </div>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <h3 className="font-semibold">{media.title}</h3>
                            {media.description && (
                                <p className="text-sm opacity-90">{media.description}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardContent className="p-6">
                <div className="text-center">
                    <p className="text-gray-500">Tipo de archivo no compatible para vista previa</p>
                    <Button onClick={handleDownload} className="mt-3">
                        <Download className="mr-2 h-4 w-4" />
                        Descargar Archivo
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}