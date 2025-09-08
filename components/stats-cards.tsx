'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Users, CheckCircle, Award, TrendingUp } from "lucide-react";
import { DashboardStats } from "@/types";

interface StatsCardsProps {
    stats?: DashboardStats;
    loading?: boolean;
}

export default function StatsCards({ stats, loading }: StatsCardsProps) {
    const statsData = [
        {
            title: "Total Usuarios",
            value: stats?.totalUsers || 0,
            change: "+5.2% vs mes anterior",
            icon: Users,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
        },
        {
            title: "Cursos Completados",
            value: stats?.completedCourses || 0,
            change: "+12.3% vs mes anterior",
            icon: CheckCircle,
            iconBg: "bg-green-100",
            iconColor: "text-green-600",
        },
        {
            title: "Certificados Emitidos",
            value: stats?.certificatesIssued || 0,
            change: "+8.7% vs mes anterior",
            icon: Award,
            iconBg: "bg-yellow-100",
            iconColor: "text-yellow-600",
        },
        {
            title: "Tasa de Aprobación",
            value: `${stats?.passRate || 0}%`,
            change: "+2.1% vs mes anterior",
            icon: TrendingUp,
            iconBg: "bg-purple-100",
            iconColor: "text-purple-600",
        },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="border border-gray-200">
                        <CardContent className="p-6">
                            <div className="animate-pulse">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                </div>
                                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Card key={index} className="bg-white shadow border border-gray-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                                <div className={`p-3 ${stat.iconBg} rounded-full`}>
                                    <Icon className={`${stat.iconColor}`} size={24} />
                                </div>
                            </div>
                            <p className={`text-sm mt-2 text-green-600`}>
                                ↗ {stat.change}
                            </p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}