'use client';

import { useSafeQuery } from "@/hooks/useSafeQuery";
import Sidebar from "@/components/sidebar";
import CertificateGenerator from "@/components/certificate-generator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Download, Eye, QrCode } from "lucide-react";
import { Certificate } from "@/types";
import { exportCertificatesToExcel } from "@/lib/exportUtils";
import { useToast } from "@/hooks/use-toast-simple";

interface ApiCertificate {
    id: string;
    certificate_number: string;
    user_id: string;
    course_id: string;
    score: number;
    issued_by: string;
    issued_at: string;
    expiration_date: string;
    user_first_name: string;
    user_last_name: string;
    course_title: string;
    validity_status: string;
}

export default function CertificatesPage() {
    const { toast } = useToast();

    const { data: certificates, isLoading: certificatesLoading } = useSafeQuery<ApiCertificate[]>({
        queryKey: ['/api/certificates'],
    });

    const handleExportCertificates = () => {
        if (certificates && certificates.length > 0) {
            exportCertificatesToExcel(certificates);
            toast({
                title: "Exportación exitosa",
                description: "Los datos de certificados han sido exportados a Excel.",
            });
        } else {
            toast({
                title: "Sin datos",
                description: "No hay certificados para exportar.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Award className="text-blue-600" size={28} />
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Certificados</h2>
                                <p className="text-gray-600">Gestiona y genera certificados de completación</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleExportCertificates}
                            disabled={!certificates || certificates.length === 0}
                        >
                            <Download className="mr-2" size={16} />
                            Exportar
                        </Button>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-6 space-y-6">
                    <CertificateGenerator />

                    <div className="bg-white rounded-lg shadow border border-gray-200">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Certificados Emitidos</h3>
                            <p className="text-sm text-gray-600">Historial de certificados generados</p>
                        </div>

                        <div className="p-4">
                            {certificatesLoading ? (
                                <div className="flex justify-center items-center h-32">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                        <p className="text-gray-600 text-sm">Cargando certificados...</p>
                                    </div>
                                </div>
                            ) : certificates && certificates.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {certificates.map((certificate) => (
                                        <Card key={certificate.id} className="hover:shadow-md transition-shadow">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                                        <Award className="text-yellow-600" size={20} />
                                                    </div>
                                                    <Badge variant="outline" className="text-xs">
                                                        {certificate.certificate_number}
                                                    </Badge>
                                                </div>
                                                <CardTitle className="text-sm font-medium">
                                                    Certificado de Completación
                                                </CardTitle>
                                                <CardDescription className="text-xs">
                                                    Emitido por {certificate.issued_by}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="pt-0">
                                                <div className="space-y-3">
                                                    <div className="text-xs text-gray-600">
                                                        <p>Fecha: {new Date(certificate.issued_at).toLocaleDateString('es-ES')}</p>
                                                        <p>Puntuación: {certificate.score}%</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Button size="sm" variant="outline" className="flex-1">
                                                            <Eye className="mr-1" size={12} />
                                                            Ver
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="flex-1">
                                                            <Download className="mr-1" size={12} />
                                                            PDF
                                                        </Button>
                                                        <Button size="sm" variant="outline">
                                                            <QrCode size={12} />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">No hay certificados</h3>
                                    <p className="text-sm text-gray-600">Los certificados aparecerán aquí una vez generados</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}