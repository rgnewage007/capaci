// app/courses/[courseId]/module/[moduleId]/page.tsx
'use client';

import { useParams } from "next/navigation";
import { useSafeQuery } from "@/hooks/useSafeQuery";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

export default function ModulePage() {
    const params = useParams();
    const courseId = params.courseId as string;
    const moduleId = params.moduleId as string;

    const { data: module, isLoading } = useSafeQuery({
        queryKey: ['/api/modules', moduleId],
    });

    const { data: course } = useSafeQuery({
        queryKey: ['/api/courses', courseId],
    });

    const { data: nextModule } = useSafeQuery({
        queryKey: ['/api/modules', moduleId, 'next'],
    });

    if (isLoading) {
        return <div>Cargando módulo...</div>;
    }

    const renderContent = () => {
        if (!module?.media) return null;

        switch (module.content_type) {
            case 'video':
                return (
                    <video
                        controls
                        className="w-full h-auto max-w-4xl mx-auto"
                        poster={module.media.thumbnail_url}
                    >
                        <source src={`/api/media/stream/${module.media.filename}`} type="video/mp4" />
                        Tu navegador no soporta el elemento de video.
                    </video>
                );

            case 'image':
                return (
                    <img
                        src={`/uploads/${module.media.filename}`}
                        alt={module.title}
                        className="w-full h-auto max-w-4xl mx-auto rounded-lg"
                    />
                );

            default:
                return (
                    <div className="bg-white rounded-lg p-6">
                        <p>Contenido no disponible para visualización</p>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" href={`/courses/${courseId}`}>
                            <ArrowLeft size={20} />
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{course?.title}</h2>
                            <p className="text-gray-600">Módulo: {module?.title}</p>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-6">
                    <div className="max-w-4xl mx-auto">
                        {/* Progress bar */}
                        <div className="mb-6">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <span>Progreso del módulo</span>
                                <span>25% completado</span>
                            </div>
                            <Progress value={25} />
                        </div>

                        {/* Content */}
                        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                            {renderContent()}
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-lg shadow p-6 mb-6">
                            <h3 className="text-lg font-semibold mb-3">Acerca de este módulo</h3>
                            <p className="text-gray-700">{module?.description}</p>
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between">
                            <Button variant="outline">
                                <ArrowLeft className="mr-2" size={16} />
                                Módulo Anterior
                            </Button>

                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <CheckCircle className="mr-2" size={16} />
                                Marcar como Completado
                            </Button>

                            {nextModule && (
                                <Button variant="outline" href={`/courses/${courseId}/module/${nextModule.id}`}>
                                    Siguiente Módulo
                                    <ArrowRight className="ml-2" size={16} />
                                </Button>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}