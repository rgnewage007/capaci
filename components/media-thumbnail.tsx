// components/media-thumbnail.tsx
'use client';

import { Play, Image, File, Video } from "lucide-react";

interface MediaThumbnailProps {
    media: any;
    onClick?: () => void;
    className?: string;
}

export function MediaThumbnail({ media, onClick, className = '' }: MediaThumbnailProps) {
    const getIcon = () => {
        if (media.file_type.startsWith('video')) return <Video className="h-8 w-8" />;
        if (media.file_type.startsWith('image')) return <Image className="h-8 w-8" />;
        return <File className="h-8 w-8" />;
    };

    return (
        <div
            className={`relative group cursor-pointer overflow-hidden rounded-lg bg-gray-100 ${className}`}
            onClick={onClick}
        >
            {media.file_type.startsWith('image') ? (
                <img
                    src={`/uploads/${media.filename}`}
                    alt={media.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    {getIcon()}
                </div>
            )}

            {media.file_type.startsWith('video') && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black bg-opacity-50 rounded-full p-2">
                        <Play className="h-6 w-6 text-white" />
                    </div>
                </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-sm font-medium truncate">{media.title}</p>
                <p className="text-white text-xs opacity-75">{media.file_type.split('/')[1]}</p>
            </div>
        </div>
    );
}