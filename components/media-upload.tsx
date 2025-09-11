'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast-simple';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Upload, File, Image, Video, X, CheckCircle } from 'lucide-react';

const uploadSchema = z.object({
    title: z.string().min(1, 'El título es requerido'),
    description: z.string().optional(),
    courseId: z.string().optional(),
    moduleId: z.string().optional(),
});

type UploadForm = z.infer<typeof uploadSchema>;

interface MediaUploadProps {
    courses: any[];
    modules: any[];
    onUploadSuccess?: () => void;
}

export default function MediaUpload({ courses, modules, onUploadSuccess }: MediaUploadProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<UploadForm>({
        resolver: zodResolver(uploadSchema),
        defaultValues: {
            title: '',
            description: '',
            courseId: '',
            moduleId: '',
        }
    });

    const selectedCourseId = watch('courseId');

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setValue('title', file.name);
        }
    };

    const onSubmit = async (data: UploadForm) => {
        if (!selectedFile) {
            toast({
                title: "Error",
                description: "Por favor selecciona un archivo",
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', data.title);
        formData.append('description', data.description || '');
        if (data.courseId) formData.append('courseId', data.courseId);
        if (data.moduleId) formData.append('moduleId', data.moduleId);

        try {
            const response = await fetch('/api/media/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                toast({
                    title: "¡Éxito!",
                    description: "Archivo subido correctamente",
                });

                setSelectedFile(null);
                setUploadProgress(0);
                if (fileInputRef.current) fileInputRef.current.value = '';

                if (onUploadSuccess) onUploadSuccess();
            } else {
                throw new Error('Error en la subida');
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo subir el archivo",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const getFileIcon = () => {
        if (!selectedFile) return <Upload className="h-12 w-12" />;

        if (selectedFile.type.startsWith('image')) return <Image className="h-12 w-12 text-blue-500" />;
        if (selectedFile.type.startsWith('video')) return <Video className="h-12 w-12 text-red-500" />;

        return <File className="h-12 w-12 text-gray-500" />;
    };

    const getFileTypeText = () => {
        if (!selectedFile) return 'Selecciona un archivo';

        if (selectedFile.type.startsWith('image')) return 'Imagen';
        if (selectedFile.type.startsWith('video')) return 'Video';

        return 'Documento';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Subir Archivo Multimedia</CardTitle>
                <CardDescription>
                    Sube imágenes y videos para tus cursos
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Selector de archivo */}
                    <div className="space-y-2">
                        <Label htmlFor="file">Archivo</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <div className="flex flex-col items-center justify-center space-y-3">
                                {getFileIcon()}
                                <div>
                                    <p className="font-medium">{getFileTypeText()}</p>
                                    {selectedFile && (
                                        <p className="text-sm text-gray-500">
                                            {selectedFile.name} • {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    )}
                                </div>
                                <Input
                                    id="file"
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="image/*,video/*"
                                    className="hidden"
                                />
                                <Label htmlFor="file">
                                    <Button variant="outline" asChild>
                                        <span>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Seleccionar archivo
                                        </span>
                                    </Button>
                                </Label>
                            </div>
                        </div>
                    </div>

                    {/* Información del archivo */}
                    {selectedFile && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Título</Label>
                                <Input
                                    id="title"
                                    {...register('title')}
                                    placeholder="Título del archivo"
                                />
                                {errors.title && (
                                    <p className="text-sm text-red-500">{errors.title.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción (opcional)</Label>
                                <Input
                                    id="description"
                                    {...register('description')}
                                    placeholder="Descripción del archivo"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="courseId">Curso (opcional)</Label>
                                <Select onValueChange={(value) => setValue('courseId', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar curso" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map((course) => (
                                            <SelectItem key={course.id} value={course.id}>
                                                {course.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="moduleId">Módulo (opcional)</Label>
                                <Select
                                    onValueChange={(value) => setValue('moduleId', value)}
                                    disabled={!selectedCourseId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar módulo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {modules
                                            .filter((module) => module.course_id === selectedCourseId)
                                            .map((module) => (
                                                <SelectItem key={module.id} value={module.id}>
                                                    {module.title}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* Progress bar */}
                    {isUploading && (
                        <div className="space-y-2">
                            <Progress value={uploadProgress} />
                            <p className="text-sm text-gray-500">Subiendo archivo... {uploadProgress}%</p>
                        </div>
                    )}

                    {/* Botones de acción */}
                    {selectedFile && (
                        <div className="flex space-x-3">
                            <Button
                                type="submit"
                                disabled={isUploading}
                                className="flex-1"
                            >
                                {isUploading ? (
                                    <>Subiendo...</>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Subir Archivo
                                    </>
                                )}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setSelectedFile(null);
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                }}
                                disabled={isUploading}
                            >
                                <X className="mr-2 h-4 w-4" />
                                Cancelar
                            </Button>
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}