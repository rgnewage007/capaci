'use client';

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    GraduationCap,
    Home,
    BookOpen,
    ClipboardCheck,
    Award,
    Users,
    BarChart3,
    Settings,
    Menu,
    ChevronDown,
    User,
    FolderOpen,
    FileText,
    Download
} from "lucide-react";
import Link from "next/link";

// Definir los items del menú sin duplicados
const menuItems = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: BookOpen, label: "Capacitaciones", href: "/courses" },
    { icon: ClipboardCheck, label: "Evaluaciones", href: "/evaluations" },
    { icon: Award, label: "Certificados", href: "/certificates" },
    { icon: Users, label: "Usuarios", href: "/users" },
    { icon: BarChart3, label: "Reportes", href: "/reports" },
    { icon: FolderOpen, label: "Biblioteca", href: "/media" },
    { icon: Settings, label: "Configuración", href: "/settings" },
];

// Cursos de ejemplo para el submenú
const exampleCourses = [
    { title: "Seguridad Industrial", href: "/courses/seguridad-industrial" },
    { title: "Primeros Auxilios", href: "/courses/primeros-auxilios" },
    { title: "Manejo Defensivo", href: "/courses/manejo-defensivo" },
];

export default function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isCoursesExpanded, setIsCoursesExpanded] = useState(false);
    const pathname = usePathname();

    const toggleSidebar = () => {
        setIsExpanded(!isExpanded);
        if (!isExpanded) {
            setIsCoursesExpanded(false);
        }
    };

    return (
        <div className={cn(
            "bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col h-full",
            isExpanded ? "w-64" : "w-16"
        )}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <GraduationCap className="text-white" size={20} />
                    </div>
                    {isExpanded && (
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">LearningHub</h1>
                            <p className="text-xs text-gray-500">Pro Platform</p>
                        </div>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="h-8 w-8"
                >
                    <Menu className="h-4 w-4" />
                </Button>
            </div>

            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    // Manejar el caso especial de "Capacitaciones" con submenú
                    if (item.label === "Capacitaciones") {
                        return (
                            <div key={item.href} className="space-y-1">
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start h-10",
                                        isActive && "bg-blue-100 text-blue-700"
                                    )}
                                    onClick={() => isExpanded && setIsCoursesExpanded(!isCoursesExpanded)}
                                >
                                    <Icon className="h-4 w-4" />
                                    {isExpanded && (
                                        <>
                                            <span className="ml-2 text-sm">{item.label}</span>
                                            <ChevronDown
                                                className={cn(
                                                    "ml-auto transition-transform",
                                                    isCoursesExpanded && "rotate-180"
                                                )}
                                                size={14}
                                            />
                                        </>
                                    )}
                                </Button>
                                {isExpanded && isCoursesExpanded && (
                                    <div className="ml-6 space-y-1">
                                        {exampleCourses.map((course) => (
                                            <Link key={course.href} href={course.href}>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start h-8 text-xs"
                                                >
                                                    <BookOpen className="h-3 w-3 mr-1" />
                                                    {course.title}
                                                </Button>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    // Items normales del menú
                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start h-10",
                                    isActive && "bg-blue-100 text-blue-700"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {isExpanded && <span className="ml-2 text-sm">{item.label}</span>}
                            </Button>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-3 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="text-gray-600 h-4 w-4" />
                    </div>
                    {isExpanded && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">Usuario Demo</p>
                            <p className="text-xs text-gray-500 truncate">Administrador</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}