'use client';

import { useState } from "react";
import { useSafeQuery } from "@/hooks/useSafeQuery";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, Search, Loader2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface UserTableProps {
    searchTerm: string;
    roleFilter: string;
    statusFilter: string;
}

export default function UserTable({ searchTerm, roleFilter, statusFilter }: UserTableProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newUser, setNewUser] = useState({
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        role: 'student',
        phone_number: '',
        department: '',
        position: ''
    });
    const { toast } = useToast();

    const { data: users, isLoading, refetch } = useSafeQuery({
        queryKey: ['/api/users'],
    });

    const filteredUsers = users?.filter((user: any) => {
        const matchesSearch =
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.last_name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        const matchesStatus = statusFilter === "all" || user.status === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
    }) || [];

    const handleCreateUser = async () => {
        // Validaciones frontend
        if (!newUser.email || !newUser.first_name || !newUser.last_name || !newUser.password) {
            toast({
                title: "Error",
                description: "Todos los campos obligatorios deben ser llenados",
                variant: "destructive",
            });
            return;
        }

        if (newUser.password.length < 6) {
            toast({
                title: "Error",
                description: "La contraseña debe tener al menos 6 caracteres",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "¡Éxito!",
                    description: "Usuario creado correctamente",
                });

                // Resetear formulario
                setNewUser({
                    email: '',
                    first_name: '',
                    last_name: '',
                    password: '',
                    role: 'student',
                    phone_number: '',
                    department: '',
                    position: ''
                });
                setIsCreating(false);
                refetch(); // Recargar la lista de usuarios
            } else {
                throw new Error(data.error || 'Error al crear usuario');
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "No se pudo crear el usuario",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;

        try {
            const response = await fetch(`/api/users?id=${userId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast({
                    title: "Usuario eliminado",
                    description: "El usuario ha sido eliminado correctamente",
                });
                refetch();
            } else {
                throw new Error('Error al eliminar usuario');
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo eliminar el usuario",
                variant: "destructive",
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2">Cargando usuarios...</span>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <h3 className="font-semibold">Gestión de Usuarios</h3>
                <Button
                    onClick={() => setIsCreating(!isCreating)}
                    disabled={isCreating}
                >
                    <Plus className="mr-2" size={16} />
                    Agregar Usuario
                </Button>
            </div>

            {isCreating && (
                <div className="p-4 bg-blue-50 border-b">
                    <h4 className="font-medium mb-3 text-blue-800">Nuevo Usuario</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Email *</label>
                            <Input
                                type="email"
                                placeholder="ejemplo@correo.com"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Contraseña *</label>
                            <Input
                                type="password"
                                placeholder="Mínimo 6 caracteres"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Nombre *</label>
                            <Input
                                placeholder="Nombre"
                                value={newUser.first_name}
                                onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Apellido *</label>
                            <Input
                                placeholder="Apellido"
                                value={newUser.last_name}
                                onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Rol</label>
                            <Select
                                value={newUser.role}
                                onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="student">Estudiante</SelectItem>
                                    <SelectItem value="instructor">Instructor</SelectItem>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Teléfono</label>
                            <Input
                                placeholder="Teléfono"
                                value={newUser.phone_number}
                                onChange={(e) => setNewUser({ ...newUser, phone_number: e.target.value })}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Departamento</label>
                            <Input
                                placeholder="Departamento"
                                value={newUser.department}
                                onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Cargo</label>
                            <Input
                                placeholder="Cargo"
                                value={newUser.position}
                                onChange={(e) => setNewUser({ ...newUser, position: e.target.value })}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <Button
                            onClick={handleCreateUser}
                            disabled={isSubmitting}
                            className="flex-1"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creando...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2" size={16} />
                                    Crear Usuario
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setIsCreating(false)}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                    </div>
                </div>
            )}

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Departamento</TableHead>
                        <TableHead>Último acceso</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredUsers.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                {users?.length === 0 ? 'No hay usuarios registrados' : 'No se encontraron resultados'}
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredUsers.map((user: any) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div>
                                        <div className="font-medium">{user.first_name} {user.last_name}</div>
                                        <div className="text-sm text-gray-600">{user.email}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={
                                        user.role === 'admin' ? 'destructive' :
                                            user.role === 'instructor' ? 'secondary' : 'default'
                                    }>
                                        {user.role === 'admin' ? 'Administrador' :
                                            user.role === 'instructor' ? 'Instructor' : 'Estudiante'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={
                                        user.status === 'active' ? 'default' :
                                            user.status === 'inactive' ? 'secondary' : 'destructive'
                                    }>
                                        {user.status === 'active' ? 'Activo' :
                                            user.status === 'inactive' ? 'Inactivo' : 'Suspendido'}
                                    </Badge>
                                </TableCell>
                                <TableCell>{user.department || '-'}</TableCell>
                                <TableCell>
                                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Nunca'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteUser(user.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}