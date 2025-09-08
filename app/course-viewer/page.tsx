'use client';

import { useSafeQuery } from "@/hooks/useSafeQuery";
import { useParams } from "next/navigation";
import Sidebar from "@/components/sidebar";
import MultimediaViewer from "@/components/multimedia-viewer";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Course, CourseModule } from "@/types";

interface CourseViewerProps {
    courseId: string;
}

export default function CourseViewer({ courseId }: CourseViewerProps) {
    const params = useParams();

    const { data: course, isLoading: courseLoading } = useSafeQuery<Course>({
        queryKey: ['/api/courses', courseId],
        enabled: !!courseId,
    });

    const { data: modules, isLoading: modulesLoading } = useSafeQuery<CourseModule[]>({
        queryKey: ['/api/courses', courseId, 'modules'],
        enabled: !!courseId,
    });

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center space-x-4">
                        <Link href="/courses">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft size={20} />
                            </Button>
                        </Link>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {courseLoading ? "Cargando..." : course?.title || "Curso no encontrado"}
                            </h2>
                            <p className="text-gray-600">
                                {course?.description || "Visualiza el contenido del curso"}
                            </p>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-6">
                    {courseLoading || modulesLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Cargando contenido del curso...</p>
                            </div>
                        </div>
                    ) : course ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <MultimediaViewer
                                    courseId={courseId || ''}
                                    modules={modules || []}
                                    currentModuleIndex={0}
                                    onModuleChange={() => { }}
                                />
                            </div>

                            <div className="bg-white rounded-lg shadow border border-gray-200">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Contenido del Curso</h3>
                                </div>
                                <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                                    {modules && modules.length > 0 ? (
                                        modules.map((module, index) => (
                                            <div
                                                key={module.id}
                                                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{module.title}</p>
                                                        <p className="text-sm text-gray-600">
                                                            {module.contentType === 'video' ? 'Video' : 'Imagen'}
                                                            {module.duration && ` • ${Math.ceil(module.duration / 60)} min`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-gray-600">No hay módulos disponibles</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Curso no encontrado</h3>
                            <p className="text-gray-600 mb-6">El curso que buscas no existe o ha sido eliminado</p>
                            <Link href="/courses">
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    Volver a Cursos
                                </Button>
                            </Link>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}