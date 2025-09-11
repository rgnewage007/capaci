'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast-simple';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (formData.password !== formData.confirmPassword) {
            toast({
                title: 'Error',
                description: 'Las contraseñas no coinciden',
                variant: 'destructive',
            });
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    role: formData.role
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Guardar token y datos de usuario
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                toast({
                    title: '¡Cuenta creada!',
                    description: `Bienvenido ${data.user.firstName}`,
                });

                // Redirigir al dashboard
                router.push('/dashboard');
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Error al crear la cuenta',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error de conexión',
                description: 'No se pudo conectar al servidor',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                        <UserPlus className="text-green-600" size={32} />
                    </div>
                    <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
                    <CardDescription>
                        Regístrate para acceder a todos los cursos
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="firstName" className="text-sm font-medium">
                                    Nombre
                                </label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    placeholder="Juan"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="lastName" className="text-sm font-medium">
                                    Apellido
                                </label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    placeholder="Pérez"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Correo Electrónico
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="tu@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="role" className="text-sm font-medium">
                                Tipo de Cuenta
                            </label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) => setFormData({ ...formData, role: value })}
                                disabled={isLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="student">Estudiante</SelectItem>
                                    <SelectItem value="instructor">Instructor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Tu contraseña"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium">
                                Confirmar Contraseña
                            </label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="Confirma tu contraseña"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-700"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            ¿Ya tienes una cuenta?{' '}
                            <Link href="/login" className="text-green-600 hover:underline">
                                Inicia sesión aquí
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}