'use client';

import Sidebar from "@/components/sidebar";
import UserTable from "@/components/user-table";
import { Users as UsersIcon, Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Users() {
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
                            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
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

                <main className="flex-1 overflow-auto p-6">
                    <UserTable />
                </main>
            </div>
        </div>
    );
}