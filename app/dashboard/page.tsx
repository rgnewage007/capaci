'use client';

import { useSafeQuery } from "@/hooks/useSafeQuery";
import Sidebar from "@/components/sidebar";
import StatsCards from "@/components/stats-cards";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DashboardStats } from "@/types";

export default function Dashboard() {
    const { data: stats, isLoading: statsLoading } = useSafeQuery<DashboardStats>({
        queryKey: ['/api/dashboard/stats'],
    });

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Dashboard de Capacitación</h2>
                            <p className="text-gray-600">Gestiona cursos, evaluaciones y certificados</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Input
                                    type="text"
                                    placeholder="Buscar..."
                                    className="w-64 pl-10 py-2"
                                />
                                <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                            </div>
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell size={20} />
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    3
                                </span>
                            </Button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-6 space-y-6">
                    <StatsCards stats={stats} loading={statsLoading} />
                    {/* Aquí puedes agregar más componentes del dashboard */}
                </main>
            </div>
        </div>
    );
}