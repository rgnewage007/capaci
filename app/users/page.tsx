'use client';

import { useState } from "react";
import { useSafeQuery } from "@/hooks/useSafeQuery";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/sidebar";
import UserTable from "@/components/user-table";
import { Users as UsersIcon, Plus, Download, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { exportUsersToExcel } from "@/lib/exportUtils";
import { User } from "@/types";

export default function UsersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const { toast } = useToast();

    const { data: users, isLoading } = useSafeQuery<User[]>({
        queryKey: ['/api/users'],
    });

    const handleExportUsers = () => {
        if (users && users.length > 0) {
            exportUsersToExcel(users);
            toast({
                title: "Exportación exitosa",
                description: "Los datos de usuarios han sido exportados a Excel.",
            });
        } else {
            toast({
                title: "Sin datos",
                description: "No hay usuarios para exportar.",
                variant: "destructive",
            });
        }
    };

    // Estadísticas para el dashboard
    const userStats = {
        total: users?.length || 0,
        students: users?.filter(user => user.role === 'student').length || 0,
        instructors: users?.filter(user => user.role === 'instructor').length || 0,
        admins: users?.filter(user => user.role === 'admin').length || 0,
        active: users?.filter(user => user.status === 'active').length || 0,
        inactive: users?.filter(user => user.status === 'inactive').length || 0,
        suspended: users?.filter(user => user.status === 'suspended').length || 0,
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <UsersIcon className="text-blue-600" size={28} />
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
                                <p className="text-gray-600">Administra usuarios y sus capacitaciones</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Button
                                variant="outline"
                                onClick={handleExportUsers}
                                disabled={!users || users.length === 0}
                            >
                                <Download className="mr-2" size={16} />
                                Exportar
                            </Button>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="mr-2" size={16} />
                                Agregar Usuario
                            </Button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-6 space-y-6">
                    {/* Dashboard de estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{userStats.total}</div>
                                <p className="text-xs text-gray-600 mt-1">Usuarios registrados</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Por Rol</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Estudiantes</span>
                                        <Badge variant="outline">{userStats.students}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Instructores</span>
                                        <Badge variant="secondary">{userStats.instructors}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Administradores</span>
                                        <Badge variant="destructive">{userStats.admins}</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Por Estado</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Activos</span>
                                        <Badge variant="default">{userStats.active}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Inactivos</span>
                                        <Badge variant="secondary">{userStats.inactive}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Suspendidos</span>
                                        <Badge variant="destructive">{userStats.suspended}</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Actividad Reciente</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">+12%</div>
                                <p className="text-xs text-gray-600 mt-1">Crecimiento mensual</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filtros y búsqueda */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Buscar por nombre, email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger className="w-full sm:w-40">
                                        <SelectValue placeholder="Todos los roles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los roles</SelectItem>
                                        <SelectItem value="admin">Administrador</SelectItem>
                                        <SelectItem value="instructor">Instructor</SelectItem>
                                        <SelectItem value="student">Estudiante</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full sm:w-40">
                                        <SelectValue placeholder="Todos los estados" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los estados</SelectItem>
                                        <SelectItem value="active">Activo</SelectItem>
                                        <SelectItem value="inactive">Inactivo</SelectItem>
                                        <SelectItem value="suspended">Suspendido</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button variant="outline" className="w-full sm:w-auto">
                                    <Filter className="mr-2" size={16} />
                                    Filtrar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabla de usuarios */}
                    <UserTable
                        searchTerm={searchTerm}
                        roleFilter={roleFilter}
                        statusFilter={statusFilter}
                    />
                </main>
            </div>
        </div>
    );
}