// components/course-content-viewer.tsx
'use client';

import { useSafeQuery } from "@/hooks/useSafeQuery";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Lock, CheckCircle } from "lucide-react";

interface CourseContentViewerProps {
    courseId: string;
    moduleId?: string;
}

export default function CourseContentViewer({ courseId, moduleId }: CourseContentViewerProps) {
    const { data: modules, isLoading } = useSafeQuery({
        queryKey: ['/api/courses', courseId, 'modules'],
    });

    const { data: userProgress } = useSafeQuery({
        queryKey: ['/api/user-progress', courseId],
    });

    if (isLoading) {
        return <div>Cargando contenido...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Contenido del Curso</h2>

                <div className="space-y-3">
                    {modules?.map((module: any, index: number) => {
                        const progress = userProgress?.modules?.find((m: any) => m.moduleId === module.id);
                        const isCompleted = progress?.status === 'completed';
                        const isCurrent = module.id === moduleId;

                        return (
                            <div
                                key={module.id}
                                className={`flex items-center justify-between p-4 rounded-lg border-2 ${isCurrent
                                        ? 'border-blue-500 bg-blue-50'
                                        : isCompleted
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {isCompleted ? (
                                            <CheckCircle size={16} />
                                        ) : (
                                            <span className="text-sm font-medium">{index + 1}</span>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="font-medium">{module.title}</h3>
                                        <p className="text-sm text-gray-600">
                                            {module.content_type === 'video' ? 'Video' : 'Contenido'} •
                                            {module.duration ? ` ${Math.ceil(module.duration / 60)}min` : ' Duración variable'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {progress && (
                                        <Progress value={progress.percentage} className="w-20" />
                                    )}

                                    <Button
                                        variant={isCurrent ? "default" : "outline"}
                                        size="sm"
                                        href={`/courses/${courseId}/module/${module.id}`}
                                    >
                                        {isCurrent ? 'Continuar' : 'Comenzar'}
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}