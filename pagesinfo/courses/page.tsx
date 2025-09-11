'use client';

import { useSafeQuery } from "@/hooks/useSafeQuery";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Clock, Plus, Download } from "lucide-react";
import Link from "next/link";
import { Course } from "@/types";
import { exportCoursesToExcel } from "@/lib/exportUtils";
import { useToast } from "@/hooks/use-toast-simple";

export default function Courses() {
    const { toast } = useToast();

    const { data: courses, isLoading: coursesLoading } = useSafeQuery<Course[]>({
        queryKey: ['/api/courses'],
    });

    const handleExportCourses = () => {
        if (courses && courses.length > 0) {
            exportCoursesToExcel(courses);
            toast({
                title: "Exportación exitosa",
                description: "Los datos de cursos han sido exportados a Excel.",
            });
        } else {
            toast({
                title: "Sin datos",
                description: "No hay cursos para exportar.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Capacitaciones</h2>
                            <p className="text-gray-600">Gestiona y visualiza todos los cursos disponibles</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Button
                                variant="outline"
                                onClick={handleExportCourses}
                                disabled={!courses || courses.length === 0}
                            >
                                <Download className="mr-2" size={16} />
                                Exportar a Excel
                            </Button>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="mr-2" size={16} />
                                Nuevo Curso
                            </Button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-6">
                    {coursesLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Cargando cursos...</p>
                            </div>
                        </div>
                    ) : courses && courses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map((course) => (
                                <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                                                <BookOpen className="text-white" size={24} />
                                            </div>
                                            <Badge variant={course.isActive ? "default" : "secondary"}>
                                                {course.isActive ? "Activo" : "Inactivo"}
                                            </Badge>
                                        </div>
                                        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                                        <CardDescription className="line-clamp-3">
                                            {course.description || "Sin descripción disponible"}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-sm text-gray-600">
                                                <div className="flex items-center space-x-1">
                                                    <Clock size={14} />
                                                    <span>{course.duration ? `${course.duration} min` : "Sin duración"}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Users size={14} />
                                                    <span>0 estudiantes</span>
                                                </div>
                                            </div>
                                            <Link href={`/courses/${course.id}`}>
                                                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                                    Ver Curso
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cursos disponibles</h3>
                            <p className="text-gray-600 mb-6">Comienza creando tu primer curso de capacitación</p>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="mr-2" size={16} />
                                Crear Primer Curso
                            </Button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}