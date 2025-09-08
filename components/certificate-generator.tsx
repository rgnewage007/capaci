"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
    Award,
    Download,
    Mail,
    GraduationCap,
    Send,
    User,
    BookOpen,
} from "lucide-react";

interface UserType {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
}

interface Course {
    id: string;
    title: string;
}

const certificateSchema = z.object({
    userId: z.string().min(1, "Selecciona un estudiante"),
    courseId: z.string().min(1, "Selecciona un curso"),
    score: z.coerce.number().min(0).max(100),
    issuedBy: z.string().min(1, "El nombre del instructor es requerido"),
    expirationDays: z.coerce.number().min(30).max(365).default(365),
});

type CertificateForm = z.infer<typeof certificateSchema>;

interface PreviewData {
    studentName: string;
    studentEmail: string;
    courseName: string;
    score: number;
    issuedBy: string;
    certificateNumber?: string;
    issuedAt?: string;
    expirationDate?: string;
}

export default function CertificateGenerator() {
    const [students, setStudents] = useState<UserType[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [errorStudents, setErrorStudents] = useState<string | null>(null);
    const [errorCourses, setErrorCourses] = useState<string | null>(null);
    const [previewData, setPreviewData] = useState<PreviewData | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const form = useForm<CertificateForm>({
        resolver: zodResolver(certificateSchema),
        defaultValues: {
            userId: "none",
            courseId: "none",
            score: 85,
            issuedBy: "Instructor Principal",
            expirationDays: 365,
        },
    });

    // Fetch Students
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setLoadingStudents(true);
                const response = await axios.get<UserType[]>("/api/users");
                const filtered = response.data.filter((u) => u.role === "student");
                setStudents(filtered);
            } catch (err: any) {
                console.error(err);
                setErrorStudents("Error al cargar estudiantes");
            } finally {
                setLoadingStudents(false);
            }
        };
        fetchStudents();
    }, []);

    // Fetch Courses
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoadingCourses(true);
                const response = await axios.get<Course[]>("/api/courses");
                setCourses(response.data);
            } catch (err: any) {
                console.error(err);
                setErrorCourses("Error al cargar cursos");
            } finally {
                setLoadingCourses(false);
            }
        };
        fetchCourses();
    }, []);

    const selectedUserId = form.watch("userId");
    const selectedCourseId = form.watch("courseId");
    const score = form.watch("score");
    const issuedBy = form.watch("issuedBy");

    const selectedStudent = students.find((s) => s.id === selectedUserId);
    const selectedCourse = courses.find((c) => c.id === selectedCourseId);

    useEffect(() => {
        if (selectedStudent && selectedCourse) {
            setPreviewData({
                studentName: `${selectedStudent.first_name} ${selectedStudent.last_name}`,
                studentEmail: selectedStudent.email,
                courseName: selectedCourse.title,
                score,
                issuedBy,
            });
        } else {
            setPreviewData(null);
        }
    }, [selectedStudent, selectedCourse, score, issuedBy]);

    const onSubmit = async (data: CertificateForm) => {
        setIsGenerating(true);
        try {
            const response = await fetch("/api/certificates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: data.userId,
                    course_id: data.courseId,
                    score: data.score,
                    issued_by: data.issuedBy,
                    expiration_days: data.expirationDays,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al generar certificado");
            }

            const certificate = await response.json();

            toast({
                title: "✅ Certificado generado",
                description: `Certificado ${certificate.certificate_number} creado exitosamente.`,
            });

            setPreviewData((prev) =>
                prev
                    ? {
                        ...prev,
                        certificateNumber: certificate.certificate_number,
                        issuedAt: certificate.issued_at,
                        expirationDate: certificate.expiration_date,
                    }
                    : null
            );
        } catch (error: any) {
            toast({
                title: "❌ Error",
                description: error.message || "No se pudo generar el certificado",
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadPDF = () => {
        if (!previewData?.certificateNumber) return;

        const link = document.createElement("a");
        link.href = `/api/certificates/pdf/${previewData.certificateNumber}`;
        link.download = `certificado-${previewData.certificateNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSendEmail = async () => {
        if (!previewData?.certificateNumber || !selectedUserId) return;

        try {
            const response = await fetch("/api/certificates/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: selectedUserId,
                    certificateNumber: previewData.certificateNumber,
                }),
            });

            if (!response.ok) throw new Error("Error al enviar email");

            toast({
                title: "📧 Email enviado",
                description: "El certificado ha sido enviado por correo electrónico.",
            });
        } catch {
            toast({
                title: "❌ Error",
                description: "No se pudo enviar el email",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulario */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Award className="text-blue-600" size={20} />
                        <span>Generar Certificado</span>
                    </CardTitle>
                    <CardDescription>Crear certificado con QR único para verificación</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {/* Estudiante */}
                            <FormField
                                control={form.control}
                                name="userId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center">
                                            <User className="mr-2 h-4 w-4" /> Estudiante
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar estudiante..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none" disabled>
                                                    Selecciona un estudiante
                                                </SelectItem>
                                                {loadingStudents && (
                                                    <SelectItem value="loading" disabled>
                                                        Cargando estudiantes...
                                                    </SelectItem>
                                                )}
                                                {!loadingStudents &&
                                                    students.map((user) => (
                                                        <SelectItem key={user.id} value={user.id}>
                                                            {user.first_name} {user.last_name} - {user.email}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        {errorStudents && <p className="text-red-500 text-sm mt-1">{errorStudents}</p>}
                                    </FormItem>
                                )}
                            />

                            {/* Curso */}
                            <FormField
                                control={form.control}
                                name="courseId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center">
                                            <BookOpen className="mr-2 h-4 w-4" /> Curso Completado
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar curso..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none" disabled>
                                                    Selecciona un curso
                                                </SelectItem>
                                                {loadingCourses && (
                                                    <SelectItem value="loading" disabled>
                                                        Cargando cursos...
                                                    </SelectItem>
                                                )}
                                                {!loadingCourses &&
                                                    courses.map((course) => (
                                                        <SelectItem key={course.id} value={course.id}>
                                                            {course.title}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        {errorCourses && <p className="text-red-500 text-sm mt-1">{errorCourses}</p>}
                                    </FormItem>
                                )}
                            />

                            {/* Calificación */}
                            <FormField
                                control={form.control}
                                name="score"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Calificación (%)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={0} max={100} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Instructor */}
                            <FormField
                                control={form.control}
                                name="issuedBy"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Instructor</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nombre del instructor" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex space-x-3 pt-4">
                                <Button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    disabled={isGenerating || selectedUserId === "none" || selectedCourseId === "none"}
                                >
                                    {isGenerating ? "Generando..." : "Generar Certificado"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Vista Previa */}
            <Card>
                <CardHeader>
                    <CardTitle>Vista Previa del Certificado</CardTitle>
                    <CardDescription>Certificado generado con código QR único</CardDescription>
                </CardHeader>
                <CardContent>
                    {previewData ? (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-lg p-6 text-center">
                            <div className="mb-4">
                                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <GraduationCap className="text-white" size={32} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-1">CERTIFICADO DE COMPLETACIÓN</h2>
                            </div>

                            <p className="text-sm">Se certifica que</p>
                            <p className="text-xl font-bold text-blue-600">{previewData.studentName}</p>
                            <p className="text-sm">ha completado satisfactoriamente el curso de</p>
                            <p className="text-lg font-semibold text-gray-900">{previewData.courseName}</p>
                            <p className="text-xs">
                                con una calificación de <span className="font-semibold text-green-600">{previewData.score}%</span>
                            </p>

                            {previewData.certificateNumber && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-xs text-gray-500">Nº de certificado: {previewData.certificateNumber}</p>
                                    <p className="text-xs text-gray-500">
                                        Válido hasta: {new Date(previewData.expirationDate!).toLocaleDateString()}
                                    </p>
                                </div>
                            )}

                            <div className="flex space-x-3 mt-4">
                                <Button
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                    onClick={handleDownloadPDF}
                                    disabled={!previewData.certificateNumber}
                                >
                                    <Download className="mr-2" size={16} />
                                    Descargar PDF
                                </Button>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" disabled={!previewData.certificateNumber || !previewData.studentEmail}>
                                            <Mail className="mr-2" size={16} />
                                            Enviar por Email
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Enviar Certificado por Email</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                ¿Deseas enviar el certificado a {previewData.studentEmail}?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleSendEmail}>
                                                <Send className="mr-2" size={16} />
                                                Enviar Email
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Award className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Vista previa del certificado</h3>
                            <p className="text-gray-600">Completa el formulario para ver una vista previa del certificado</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
