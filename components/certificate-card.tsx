'use client';

import { Award, Calendar, Download, Eye, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface CertificateCardProps {
    certificate: {
        id: string;
        course_title: string;
        issued_at: string;
        score: number;
        validity_status: 'valid' | 'expiring_soon' | 'expired';
        days_remaining: number;
        expiration_date: string;
    };
    onView: (id: string) => void;
    onDownload: (id: string) => void;
}

export function CertificateCard({ certificate, onView, onDownload }: CertificateCardProps) {
    const getStatusIcon = () => {
        switch (certificate.validity_status) {
            case 'valid':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'expiring_soon':
                return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
            case 'expired':
                return <Clock className="h-5 w-5 text-red-600" />;
            default:
                return <Award className="h-5 w-5 text-gray-600" />;
        }
    };

    const getStatusColor = () => {
        switch (certificate.validity_status) {
            case 'valid':
                return 'bg-green-100 text-green-800';
            case 'expiring_soon':
                return 'bg-yellow-100 text-yellow-800';
            case 'expired':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = () => {
        switch (certificate.validity_status) {
            case 'valid':
                return `Válido por ${certificate.days_remaining} días más`;
            case 'expiring_soon':
                return `Expira en ${certificate.days_remaining} días`;
            case 'expired':
                return 'Expirado';
            default:
                return 'Desconocido';
        }
    };

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Award className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">{certificate.course_title}</h3>
                            <p className="text-sm text-gray-600">Score: {certificate.score}%</p>
                        </div>
                    </div>
                    <Badge className={getStatusColor()}>
                        {getStatusIcon()}
                        <span className="ml-1">{getStatusText()}</span>
                    </Badge>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Emitido: {new Date(certificate.issued_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Expira: {new Date(certificate.expiration_date).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => onView(certificate.id)}
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                    </Button>
                    <Button
                        className="flex-1"
                        onClick={() => onDownload(certificate.id)}
                        disabled={certificate.validity_status === 'expired'}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar PDF
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}