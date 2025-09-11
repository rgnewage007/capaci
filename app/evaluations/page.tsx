'use client';

import { useSafeQuery } from "@/hooks/useSafeQuery";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Filter, Search, BarChart3, Clock, CheckCircle, XCircle, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast-simple";
import { exportToExcel } from "@/lib/exportUtils";
import { useState } from "react";

interface Evaluation {
    id: string;
    userId: string;
    userName: string;
    courseId: string;
    courseName: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeSpent: number;
    status: 'passed' | 'failed' | 'in-progress';
    completedAt: string;
    createdAt: string;
}

export default function EvaluationsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [courseFilter, setCourseFilter] = useState("all");
    const { toast } = useToast();

    const { data: evaluations, isLoading } = useSafeQuery<Evaluation[]>({
        queryKey: ['/api/evaluations'],
    });

    const { data: courses = [] } = useSafeQuery({
        queryKey: ['/api/courses'],
    });

    const filteredEvaluations = evaluations?.filter((evalItem) => {
        const matchesSearch =
            evalItem.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            evalItem.courseName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || evalItem.status === statusFilter;
        const matchesCourse = courseFilter === "all" || evalItem.courseId === courseFilter;

        return matchesSearch && matchesStatus && matchesCourse;
    }) || [];

    const handleExportEvaluations = () => {
        if (filteredEvaluations && filteredEvaluations.length > 0) {
            const exportData = filteredEvaluations.map(evalItem => ({
                'Estudiante': evalItem.userName,
                'Curso': evalItem.courseName,
                'Puntuación': `${evalItem.score}%`,
                'Estado': evalItem.status === 'passed' ? 'Aprobado' : evalItem.status === 'failed' ? 'Reprobado' : 'En Progreso',
                'Preguntas Correctas': `${evalItem.correctAnswers}/${evalItem.totalQuestions}`,
                'Tiempo': `${Math.floor(evalItem.timeSpent / 60)}:${(evalItem.timeSpent % 60).toString().padStart(2, '0')}`,
                'Fecha Completación': evalItem.completedAt ? new Date(evalItem.completedAt).toLocaleDateString('es-ES') : 'En progreso'
            }));

            exportToExcel(exportData, `evaluaciones_${new Date().toISOString().split('T')[0]}`);
            toast({
                title: "Exportación exitosa",
                description: "Los datos de evaluaciones han sido exportados a Excel.",
            });
        } else {
            toast({
                title: "Sin datos",
                description: "No hay evaluaciones para exportar.",
                variant: "destructive",
            });
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case "passed": return "default";
            case "failed": return "destructive";
            case "in-progress": return "secondary";
            default: return "outline";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "passed": return <CheckCircle className="h-4 w-4" />;
            case "failed": return <XCircle className="h-4 w-4" />;
            case "in-progress": return <Clock className="h-4 w-4" />;
            default: return null;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "passed": return "Aprobado";
            case "failed": return "Reprobado";
            case "in-progress": return "En Progreso";
            default: return status;
        }
    };

    const stats = {
        total: evaluations?.length || 0,
        passed: evaluations?.filter(e => e.status === 'passed').length || 0,
        failed: evaluations?.filter(e => e.status === 'failed').length || 0,
        inProgress: evaluations?.filter(e => e.status === 'in-progress').length || 0,
        averageScore: evaluations && evaluations.length > 0
            ? Math.round(evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length)
            : 0
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <BarChart3 className="text-blue-600" size={28} />
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Evaluaciones</h2>
                                <p className="text-gray-600">Resultados y seguimiento de evaluaciones</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleExportEvaluations}
                            disabled={!filteredEvaluations || filteredEvaluations.length === 0}
                        >
                            <Download className="mr-2" size={16} />
                            Exportar
                        </Button>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-6 space-y-6">
                    {/* Estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Total Evaluaciones</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Reprobadas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Puntuación Promedio</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.averageScore}%</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filtros */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Buscar por estudiante o curso..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full sm:w-40">
                                        <SelectValue placeholder="Todos los estados" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los estados</SelectItem>
                                        <SelectItem value="passed">Aprobado</SelectItem>
                                        <SelectItem value="failed">Reprobado</SelectItem>
                                        <SelectItem value="in-progress">En Progreso</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={courseFilter} onValueChange={setCourseFilter}>
                                    <SelectTrigger className="w-full sm:w-48">
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

                                <Button variant="outline" className="w-full sm:w-auto">
                                    <Filter className="mr-2" size={16} />
                                    Filtrar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabla de evaluaciones */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Evaluaciones</CardTitle>
                            <CardDescription>
                                {filteredEvaluations.length} evaluación(es) encontrada(s)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                        <p className="text-gray-600">Cargando evaluaciones...</p>
                                    </div>
                                </div>
                            ) : filteredEvaluations.length > 0 ? (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Estudiante</TableHead>
                                                <TableHead>Curso</TableHead>
                                                <TableHead>Puntuación</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead>Tiempo</TableHead>
                                                <TableHead>Fecha</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredEvaluations.map((evaluation) => (
                                                <TableRow key={evaluation.id}>
                                                    <TableCell className="font-medium">{evaluation.userName}</TableCell>
                                                    <TableCell>{evaluation.courseName}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-blue-600 h-2 rounded-full"
                                                                    style={{ width: `${evaluation.score}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-sm font-medium">{evaluation.score}%</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={getStatusBadgeVariant(evaluation.status)}
                                                            className="flex items-center space-x-1"
                                                        >
                                                            {getStatusIcon(evaluation.status)}
                                                            <span>{getStatusText(evaluation.status)}</span>
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {Math.floor(evaluation.timeSpent / 60)}:
                                                        {(evaluation.timeSpent % 60).toString().padStart(2, '0')}
                                                    </TableCell>
                                                    <TableCell>
                                                        {evaluation.completedAt
                                                            ? new Date(evaluation.completedAt).toLocaleDateString('es-ES')
                                                            : 'En progreso'
                                                        }
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm">
                                                            <BarChart3 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        {searchTerm || statusFilter !== "all" || courseFilter !== "all"
                                            ? "No se encontraron evaluaciones"
                                            : "No hay evaluaciones registradas"
                                        }
                                    </h3>
                                    <p className="text-gray-600">
                                        {searchTerm || statusFilter !== "all" || courseFilter !== "all"
                                            ? "Intenta ajustar los filtros de búsqueda"
                                            : "Las evaluaciones aparecerán aquí una vez completadas"
                                        }
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}