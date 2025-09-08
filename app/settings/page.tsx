'use client';

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
    Save,
    Download,
    Upload,
    Bell,
    Shield,
    Globe,
    Mail,
    User,
    Lock,
    Palette,
    Database,
    Server,
    CreditCard,
    Users,
    FileText
} from "lucide-react";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("general");
    const { toast } = useToast();

    // Estados para los settings
    const [settings, setSettings] = useState({
        // General
        companyName: "LearningHub Pro",
        timezone: "America/Mexico_City",
        language: "es",
        dateFormat: "DD/MM/YYYY",

        // Notifications
        emailNotifications: true,
        pushNotifications: false,
        courseCompletions: true,
        newUsers: true,
        systemAlerts: true,

        // Security
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordExpiration: 90,
        loginAttempts: 5,

        // Appearance
        theme: "light",
        sidebarCollapsed: false,
        animations: true,

        // Integration
        apiEnabled: false,
        webhooksEnabled: false,
        analyticsEnabled: true,
    });

    const handleSave = () => {
        toast({
            title: "Configuración guardada",
            description: "Tus cambios se han guardado exitosamente.",
        });
    };

    const handleExportSettings = () => {
        toast({
            title: "Configuración exportada",
            description: "La configuración ha sido exportada exitosamente.",
        });
    };

    const handleImportSettings = () => {
        toast({
            title: "Configuración importada",
            description: "La configuración ha sido importada exitosamente.",
        });
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <SettingsIcon className="text-blue-600" size={28} />
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>
                                <p className="text-gray-600">Personaliza la plataforma a tus necesidades</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Button variant="outline" onClick={handleExportSettings}>
                                <Download className="mr-2" size={16} />
                                Exportar
                            </Button>
                            <Button variant="outline" onClick={handleImportSettings}>
                                <Upload className="mr-2" size={16} />
                                Importar
                            </Button>
                            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                                <Save className="mr-2" size={16} />
                                Guardar Cambios
                            </Button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-7 gap-2">
                            <TabsTrigger value="general" className="flex items-center space-x-2">
                                <SettingsIcon size={16} />
                                <span>General</span>
                            </TabsTrigger>
                            <TabsTrigger value="notifications" className="flex items-center space-x-2">
                                <Bell size={16} />
                                <span>Notificaciones</span>
                            </TabsTrigger>
                            <TabsTrigger value="security" className="flex items-center space-x-2">
                                <Shield size={16} />
                                <span>Seguridad</span>
                            </TabsTrigger>
                            <TabsTrigger value="appearance" className="flex items-center space-x-2">
                                <Palette size={16} />
                                <span>Apariencia</span>
                            </TabsTrigger>
                            <TabsTrigger value="integrations" className="flex items-center space-x-2">
                                <Server size={16} />
                                <span>Integraciones</span>
                            </TabsTrigger>
                            <TabsTrigger value="billing" className="flex items-center space-x-2">
                                <CreditCard size={16} />
                                <span>Facturación</span>
                            </TabsTrigger>
                            <TabsTrigger value="users" className="flex items-center space-x-2">
                                <Users size={16} />
                                <span>Usuarios</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* General Settings */}
                        <TabsContent value="general">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Información de la Empresa</CardTitle>
                                        <CardDescription>Configura los datos básicos de tu organización</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="companyName">Nombre de la Empresa</Label>
                                            <Input
                                                id="companyName"
                                                value={settings.companyName}
                                                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="timezone">Zona Horaria</Label>
                                            <Select value={settings.timezone} onValueChange={(value) => setSettings({ ...settings, timezone: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar zona horaria" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="America/Mexico_City">Ciudad de México (UTC-6)</SelectItem>
                                                    <SelectItem value="America/New_York">Nueva York (UTC-5)</SelectItem>
                                                    <SelectItem value="Europe/Madrid">Madrid (UTC+1)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="language">Idioma</Label>
                                                <Select value={settings.language} onValueChange={(value) => setSettings({ ...settings, language: value })}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar idioma" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="es">Español</SelectItem>
                                                        <SelectItem value="en">English</SelectItem>
                                                        <SelectItem value="pt">Português</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="dateFormat">Formato de Fecha</Label>
                                                <Select value={settings.dateFormat} onValueChange={(value) => setSettings({ ...settings, dateFormat: value })}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar formato" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Información del Sistema</CardTitle>
                                        <CardDescription>Estado y detalles técnicos de la plataforma</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm font-medium">Versión</span>
                                            <Badge variant="outline">v2.1.0</Badge>
                                        </div>

                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm font-medium">Última Actualización</span>
                                            <span className="text-sm text-gray-600">2024-01-15</span>
                                        </div>

                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm font-medium">Estado</span>
                                            <Badge variant="default" className="bg-green-100 text-green-800">Operativo</Badge>
                                        </div>

                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm font-medium">Espacio Utilizado</span>
                                            <span className="text-sm text-gray-600">2.5 GB / 10 GB</span>
                                        </div>

                                        <div className="pt-4">
                                            <Button variant="outline" className="w-full">
                                                <Database className="mr-2" size={16} />
                                                Respaldar Base de Datos
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Notifications Settings */}
                        <TabsContent value="notifications">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Configuración de Notificaciones</CardTitle>
                                    <CardDescription>Gestiona cómo y cuándo recibir notificaciones</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="email-notifications">Notificaciones por Email</Label>
                                            <p className="text-sm text-gray-500">Recibir notificaciones importantes por correo electrónico</p>
                                        </div>
                                        <Switch
                                            id="email-notifications"
                                            checked={settings.emailNotifications}
                                            onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="push-notifications">Notificaciones Push</Label>
                                            <p className="text-sm text-gray-500">Notificaciones en tiempo real en el navegador</p>
                                        </div>
                                        <Switch
                                            id="push-notifications"
                                            checked={settings.pushNotifications}
                                            onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
                                        />
                                    </div>

                                    <div className="border-t pt-6">
                                        <h3 className="font-medium mb-4">Tipos de Notificaciones</h3>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label htmlFor="course-completions">Completación de Cursos</Label>
                                                    <p className="text-sm text-gray-500">Cuando un usuario complete un curso</p>
                                                </div>
                                                <Switch
                                                    id="course-completions"
                                                    checked={settings.courseCompletions}
                                                    onCheckedChange={(checked) => setSettings({ ...settings, courseCompletions: checked })}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label htmlFor="new-users">Nuevos Usuarios</Label>
                                                    <p className="text-sm text-gray-500">Cuando se registre un nuevo usuario</p>
                                                </div>
                                                <Switch
                                                    id="new-users"
                                                    checked={settings.newUsers}
                                                    onCheckedChange={(checked) => setSettings({ ...settings, newUsers: checked })}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label htmlFor="system-alerts">Alertas del Sistema</Label>
                                                    <p className="text-sm text-gray-500">Notificaciones técnicas y de mantenimiento</p>
                                                </div>
                                                <Switch
                                                    id="system-alerts"
                                                    checked={settings.systemAlerts}
                                                    onCheckedChange={(checked) => setSettings({ ...settings, systemAlerts: checked })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Security Settings */}
                        <TabsContent value="security">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Autenticación y Acceso</CardTitle>
                                        <CardDescription>Configuración de seguridad para usuarios</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="two-factor">Autenticación de Dos Factores</Label>
                                                <p className="text-sm text-gray-500">Requerir 2FA para todos los usuarios</p>
                                            </div>
                                            <Switch
                                                id="two-factor"
                                                checked={settings.twoFactorAuth}
                                                onCheckedChange={(checked) => setSettings({ ...settings, twoFactorAuth: checked })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="session-timeout">Tiempo de Espera de Sesión (minutos)</Label>
                                            <Input
                                                id="session-timeout"
                                                type="number"
                                                value={settings.sessionTimeout}
                                                onChange={(e) => setSettings({ ...settings, sessionTimeout: Number(e.target.value) })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password-expiration">Expiración de Contraseña (días)</Label>
                                            <Input
                                                id="password-expiration"
                                                type="number"
                                                value={settings.passwordExpiration}
                                                onChange={(e) => setSettings({ ...settings, passwordExpiration: Number(e.target.value) })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="login-attempts">Intentos de Login Permitidos</Label>
                                            <Input
                                                id="login-attempts"
                                                type="number"
                                                value={settings.loginAttempts}
                                                onChange={(e) => setSettings({ ...settings, loginAttempts: Number(e.target.value) })}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Políticas de Seguridad</CardTitle>
                                        <CardDescription>Configuración avanzada de seguridad</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="p-4 bg-blue-50 rounded-lg">
                                            <h4 className="font-medium text-blue-900 mb-2">Recomendaciones de Seguridad</h4>
                                            <ul className="text-sm text-blue-700 space-y-1">
                                                <li>• Use contraseñas complejas con mínimo 12 caracteres</li>
                                                <li>• Active la autenticación de dos factores</li>
                                                <li>• Mantenga el software actualizado</li>
                                                <li>• Realice respaldos regularmente</li>
                                            </ul>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Registro de Actividad</Label>
                                            <div className="text-sm text-gray-600">
                                                <p>Último acceso: Hoy a las 14:30</p>
                                                <p>Dirección IP: 192.168.1.100</p>
                                                <p>Dispositivo: Chrome en Windows</p>
                                            </div>
                                        </div>

                                        <Button variant="outline" className="w-full">
                                            <FileText className="mr-2" size={16} />
                                            Ver Logs de Seguridad
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Más tabs pueden ser añadidos aquí */}

                    </Tabs>
                </main>
            </div>
        </div>
    );
}

// Componente de ícono para Settings
function SettingsIcon({ size, className }: { size: number; className?: string }) {
    return (
        <svg
            className={className}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}