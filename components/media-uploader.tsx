'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle, File, Image, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface UploadedFile {
    id: string;
    file: File;
    progress: number;
    status: 'uploading' | 'completed' | 'error';
    error?: string;
}

export function MediaUploader() {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            progress: 0,
            status: 'uploading' as const,
        }));

        setUploadedFiles(prev => [...prev, ...newFiles]);
        simulateUpload(newFiles.map(f => f.id));
    }, []);

    const simulateUpload = (fileIds: string[]) => {
        setIsUploading(true);

        fileIds.forEach((fileId, index) => {
            const interval = setInterval(() => {
                setUploadedFiles(prev => prev.map(file => {
                    if (file.id === fileId) {
                        const newProgress = file.progress + 10;
                        if (newProgress >= 100) {
                            clearInterval(interval);
                            return { ...file, progress: 100, status: 'completed' };
                        }
                        return { ...file, progress: newProgress };
                    }
                    return file;
                }));
            }, 200 + (index * 100));
        });

        setTimeout(() => setIsUploading(false), 5000);
    };

    const removeFile = (fileId: string) => {
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
            'video/*': ['.mp4', '.webm', '.mov', '.avi'],
            'audio/*': ['.mp3', '.wav', '.ogg'],
            'application/pdf': ['.pdf'],
        },
        multiple: true,
    });

    const getFileIcon = (fileType: string) => {
        if (fileType.startsWith('image')) return <Image className="h-5 w-5" />;
        if (fileType.startsWith('video')) return <Video className="h-5 w-5" />;
        return <File className="h-5 w-5" />;
    };

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
            >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                    {isDragActive ? 'Suelta los archivos aquí' : 'Arrastra archivos o haz clic para seleccionar'}
                </p>
                <p className="text-sm text-gray-600">
                    PNG, JPG, GIF, MP4, PDF hasta 100MB
                </p>
            </div>

            {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                    <h4 className="font-medium">Archivos a subir</h4>
                    {uploadedFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3 flex-1">
                                {getFileIcon(file.file.type)}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{file.file.name}</p>
                                    <p className="text-xs text-gray-600">
                                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                {file.status === 'uploading' && (
                                    <Progress value={file.progress} className="w-20" />
                                )}

                                {file.status === 'completed' && (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                )}

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(file.id)}
                                    disabled={isUploading}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}