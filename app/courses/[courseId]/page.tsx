// app/courses/[courseId]/page.tsx
'use client';

import { useSafeQuery } from "@/hooks/useSafeQuery";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play, CheckCircle, Lock, Clock } from "lucide-react";
import Link from "next/link";
export default function CoursePage() {
    const params = useParams();
    const courseId = params.courseId as string;

    const { data: course, isLoading: courseLoading } = useSafeQuery({
        queryKey: ['/api/courses', courseId],
    });

    const { data: progress, isLoading: progressLoading } = useSafeQuery({
        queryKey: ['/api/progress', { courseId }],
    });

    if (courseLoading || progressLoading) {
        return <div>Cargando...</div>;
    }

    const completedModules = progress?.filter((p: any) => p.status === 'completed') || [];
    const progressPercentage = course?.modules?.length > 0
        ? (completedModules.length / course.modules.length) * 100
        : 0;

    return (
        <div className="container mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">{course?.title}</h1>
                <p className="text-gray-600 mb-4">{course?.description}</p>

                <div className="flex items-center space-x-4">
                    <Progress value={progressPercentage} className="w-1/2" />
                    <span className="text-sm text-gray-600">{Math.round(progressPercentage)}% completado</span>
                </div>
            </div>

            <div className="grid gap-4">
                {course?.modules?.map((module: any, index: number) => {
                    const moduleProgress = progress?.find((p: any) => p.module_id === module.id);
                    const isCompleted = moduleProgress?.status === 'completed';
                    const isNext = index === 0 ||
                        (progress?.find((p: any) => p.module_id === course.modules[index - 1].id)?.status === 'completed');

                    return (
                        <Card key={module.id} className={isCompleted ? "border-green-200 bg-green-50" : ""}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-100 text-green-600' :
                                            isNext ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            {isCompleted ? (
                                                <CheckCircle size={16} />
                                            ) : isNext ? (
                                                <Play size={16} />
                                            ) : (
                                                <Lock size={16} />
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
                                        {moduleProgress && (
                                            <span className="text-sm text-gray-600">
                                                {moduleProgress.time_spent > 0 && (
                                                    <>
                                                        <Clock className="inline mr-1" size={14} />
                                                        {Math.floor(moduleProgress.time_spent / 60)}min
                                                    </>
                                                )}
                                                {moduleProgress.score > 0 && ` • ${moduleProgress.score}p`}
                                            </span>
                                        )}

                                        <Button
                                            asChild
                                            variant={isCompleted ? "outline" : "default"}
                                            disabled={!isNext}
                                        >
                                            <Link href={`/courses/${courseId}/module/${module.id}`}>
                                                {isCompleted ? 'Revisar' : isNext ? 'Comenzar' : 'Bloqueado'}
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}