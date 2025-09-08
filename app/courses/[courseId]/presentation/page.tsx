// app/courses/[courseId]/presentation/page.tsx
'use client';

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MediaCarousel from "@/components/media-carousel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Home, BookOpen } from "lucide-react";

// Datos de ejemplo para el curso
const courseData = {
    id: "seguridad-industrial",
    title: "Seguridad Industrial",
    description: "Curso completo sobre normas de seguridad en el entorno industrial.",
    mediaItems: [
        {
            id: '1',
            type: 'image' as const,
            filename: '1.jpg',
            title: 'Introducción a la Seguridad Industrial',
            description: 'Conceptos básicos y importancia de la seguridad en el ámbito industrial.'
        },
        {
            id: '2',
            type: 'image' as const,
            filename: '2.jpg',
            title: 'Equipos de Protección Personal',
            description: 'Tipos de EPP y su correcta utilización.'
        },
        {
            id: '3',
            type: 'video' as const,
            filename: '3.mp4',
            title: 'Uso Correcto de Extintores',
            description: 'Demostración práctica de técnicas de extinción de incendios.',
            duration: 120
        },
        {
            id: '4',
            type: 'exam' as const,
            filename: '',
            title: 'Evaluación de Conocimientos',
            description: 'Examen para verificar el aprendizaje del curso.',
            url: 'https://forms.google.com/your-form-link'
        },
        {
            id: '5',
            type: 'image' as const,
            filename: '5.jpg',
            title: 'Señalización de Seguridad',
            description: 'Interpretación de señales y símbolos de seguridad.'
        },
    ]
};

export default function CoursePresentationPage() {
    const params = useParams();
    const router = useRouter();
    const [courseCompleted, setCourseCompleted] = useState(false);

    // En una implementación real, obtendrías los datos del curso según el ID de los parámetros
    const course = courseData;

    const handleComplete = () => {
        setCourseCompleted(true);
        // Aquí podrías registrar la finalización del curso en tu base de datos
        console.log('Curso completado:', course.title);
    };

    const handleReturnToCourses = () => {
        router.push('/courses');
    };

    const handleGoToHome = () => {
        router.push('/');
    };

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
                            Has finalizado el curso de {course.title} exitosamente.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-gray-600">
                            Felicitaciones por completar todos los módulos del curso.
                            Puedes revisar tus certificados en tu perfil.
                        </p>
                        <div className="flex flex-col space-y-2">
                            <Button onClick={handleReturnToCourses} className="w-full">
                                Volver a Mis Cursos
                            </Button>
                            <Button onClick={handleGoToHome} variant="outline" className="w-full">
                                <Home className="mr-2" size={16} />
                                Ir al Inicio
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="container mx-auto px-4 py-4">
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
                        <h1 className="text-xl font-bold">{course.title}</h1>
                        <p className="text-sm text-gray-300">{course.description}</p>
                    </div>

                    <div className="w-24"></div> {/* Espaciador para equilibrar el diseño */}
                </div>

                <div className="h-[calc(100vh-140px)]">
                    <MediaCarousel
                        mediaItems={course.mediaItems}
                        onComplete={handleComplete}
                    />
                </div>
            </div>
        </div>
    );
}