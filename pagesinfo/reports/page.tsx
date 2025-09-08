'use client';

import { useSafeQuery } from "@/hooks/useSafeQuery";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import {
    Users, BookOpen, Award, TrendingUp, Download, Calendar,
    CheckCircle, Target
} from "lucide-react";
import { useState } from "react";
import { exportToExcel } from "@/lib/exportUtils";
import { useToast } from "@/hooks/use-toast";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Reports() {
    const [selectedCourse, setSelectedCourse] = useState<string>("all");
    const { toast } = useToast();

    const { data: stats } = useSafeQuery({
        queryKey: ['/api/dashboard/stats'],
    });

    const { data: courses = [] } = useSafeQuery({
        queryKey: ['/api/courses'],
    });

    // Datos de ejemplo serializables
    const courseCompletionData = [
        { course: 'Seguridad Industrial', completed: 45, inProgress: 12, notStarted: 8 },
        { course: 'Primeros Auxilios', completed: 38, inProgress: 15, notStarted: 12 },
        { course: 'Manejo Defensivo', completed: 52, inProgress: 8, notStarted: 5 },
        { course: 'Trabajo en Alturas', completed: 23, inProgress: 18, notStarted: 14 }
    ];

    const monthlyProgressData = [
        { month: 'Ene', usuarios: 15, certificados: 12, evaluaciones: 18 },
        { month: 'Feb', usuarios: 22, certificados: 19, evaluaciones: 25 },
        { month: 'Mar', usuarios: 18, certificados: 15, evaluaciones: 22 },
        { month: 'Abr', usuarios: 25, certificados: 22, evaluaciones: 28 },
        { month: 'May', usuarios: 30, certificados: 28, evaluaciones: 35 },
        { month: 'Jun', usuarios: 28, certificados: 25, evaluaciones: 32 }
    ];

    const userRoleDistribution = [
        { name: 'Estudiantes', value: 82, count: 164 },
        { name: 'Instructores', value: 12, count: 24 },
        { name: 'Administradores', value: 6, count: 12 }
    ];

    const topPerformingCourses = [
        { course: 'Manejo Defensivo', score: 94, completions: 52 },
        { course: 'Seguridad Industrial', score: 89, completions: 45 },
        { course: 'Primeros Auxilios', score: 87, completions: 38 },
        { course: 'Trabajo en Alturas', score: 85, completions: 23 }
    ];

    const exportReport = (reportType: string) => {
        let data: any[] = [];
        let filename = '';

        switch (reportType) {
            case 'completion':
                data = courseCompletionData;
                filename = 'reporte_completacion_cursos';
                break;
            case 'monthly':
                data = monthlyProgressData;
                filename = 'reporte_progreso_mensual';
                break;
            case 'performance':
                data = topPerformingCourses;
                filename = 'reporte_rendimiento_cursos';
                break;
            default:
                return;
        }

        exportToExcel(data, `${filename}_${new Date().toISOString().split('T')[0]}`);
        toast({
            title: "Reporte exportado",
            description: "El reporte ha sido exportado a Excel exitosamente.",
        });
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Reportes y Analíticas</h1>
                    <p className="text-gray-600">Panel de control con métricas detalladas del desempeño</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button variant="outline">
                        <Calendar className="mr-2" size={16} />
                        Filtrar por fecha
                    </Button>
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Todos los cursos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los cursos</SelectItem>
                            {courses.map((course: any) => (
                                <SelectItem key={course.id} value={course.id}>
                                    {course.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{(stats as any)?.totalUsers || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            +12% desde el mes pasado
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cursos Completados</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{(stats as any)?.completedCourses || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            +8% desde el mes pasado
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Certificados Emitidos</CardTitle>
                        <Award className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{(stats as any)?.totalCertificates || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            +15% desde el mes pasado
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tasa de Completación</CardTitle>
                        <Target className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">87.5%</div>
                        <p className="text-xs text-muted-foreground">
                            +2.3% desde el mes pasado
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Progreso por Curso</CardTitle>
                            <CardDescription>Estado de completación de cada curso</CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportReport('completion')}
                        >
                            <Download className="mr-2" size={14} />
                            Exportar
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={courseCompletionData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="course" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="completed" fill="#10b981" name="Completados" />
                                <Bar dataKey="inProgress" fill="#f59e0b" name="En Progreso" />
                                <Bar dataKey="notStarted" fill="#ef4444" name="No Iniciados" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Distribución de Usuarios</CardTitle>
                        <CardDescription>Tipos de usuario en la plataforma</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={userRoleDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {userRoleDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Tendencia Mensual</CardTitle>
                            <CardDescription>Progreso de actividades por mes</CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportReport('monthly')}
                        >
                            <Download className="mr-2" size={14} />
                            Exportar
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={monthlyProgressData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="usuarios" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Nuevos Usuarios" />
                                <Area type="monotone" dataKey="certificados" stackId="1" stroke="#10b981" fill="#10b981" name="Certificados" />
                                <Area type="monotone" dataKey="evaluaciones" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Evaluaciones" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Cursos con Mejor Rendimiento</CardTitle>
                            <CardDescription>Ranking por puntuación promedio</CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportReport('performance')}
                        >
                            <Download className="mr-2" size={14} />
                            Exportar
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topPerformingCourses.map((course, index) => (
                                <div key={course.course} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium">{course.course}</p>
                                            <p className="text-sm text-gray-600">{course.completions} completados</p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                        {course.score}% promedio
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Resumen Detallado</CardTitle>
                    <CardDescription>Estadísticas detalladas del rendimiento general</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">94.2%</div>
                            <p className="text-sm text-gray-600">Tasa de satisfacción</p>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">2.8 hrs</div>
                            <p className="text-sm text-gray-600">Tiempo promedio por curso</p>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600">89.5%</div>
                            <p className="text-sm text-gray-600">Tasa de retención</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}