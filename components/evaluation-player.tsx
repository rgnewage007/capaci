'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSafeQuery } from '@/hooks/useSafeQuery';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast-simple';
import {
    Clock,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Play,
    Shield
} from 'lucide-react';

interface EvaluationPlayerProps {
    evaluationId: string;
    userId: string;
}

export default function EvaluationPlayer({ evaluationId, userId }: EvaluationPlayerProps) {
    const [currentAttempt, setCurrentAttempt] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [startTime, setStartTime] = useState<number>(0);
    const [protectionActive, setProtectionActive] = useState(false);
    const { toast } = useToast();

    const { data: evaluation } = useSafeQuery({
        queryKey: ['/api/evaluations', evaluationId],
    });

    // Iniciar evaluación
    const startEvaluation = async () => {
        try {
            const response = await fetch(`/api/evaluations/${evaluationId}/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) throw new Error('Failed to start evaluation');

            const attempt = await response.json();
            setCurrentAttempt(attempt);
            setStartTime(Date.now());

            // Cargar preguntas
            const questionsResponse = await fetch(
                `/api/evaluations/${evaluationId}/questions?userId=${userId}&attemptId=${attempt.id}`
            );
            const questionsData = await questionsResponse.json();
            setQuestions(questionsData);

            // Iniciar temporizador si hay tiempo límite
            if (evaluation?.time_limit) {
                setTimeLeft(evaluation.time_limit * 60);
            }

            // Activar protección anti-copia
            setProtectionActive(true);
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo iniciar la evaluación",
                variant: "destructive",
            });
        }
    };

    // Protección anti-copia
    useEffect(() => {
        if (!protectionActive) return;

        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault();
            toast({
                title: "Protección activada",
                description: "No se permite copiar contenido durante la evaluación",
                variant: "destructive",
            });
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
                e.preventDefault();
                toast({
                    title: "Protección activada",
                    description: "No se permite copiar durante la evaluación",
                    variant: "destructive",
                });
            }
        };

        document.addEventListener('copy', handleCopy);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [protectionActive, toast]);

    // Temporizador
    useEffect(() => {
        if (timeLeft <= 0 || !protectionActive) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, protectionActive]);

    const handleAnswerChange = (questionId: string, optionId: string, isMultiple: boolean) => {
        setUserAnswers(prev => {
            const currentAnswers = prev[questionId] || [];

            if (isMultiple) {
                return {
                    ...prev,
                    [questionId]: currentAnswers.includes(optionId)
                        ? currentAnswers.filter(id => id !== optionId)
                        : [...currentAnswers, optionId]
                };
            } else {
                return {
                    ...prev,
                    [questionId]: [optionId]
                };
            }
        });
    };

    const handleAutoSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        await submitEvaluation(timeSpent);
    };

    const submitEvaluation = async (timeSpent: number) => {
        try {
            const answers = Object.entries(userAnswers).map(([questionId, selectedOptions]) => ({
                questionId,
                selectedOptions
            }));

            const response = await fetch(`/api/evaluations/${evaluationId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    attemptId: currentAttempt.id,
                    answers,
                    timeSpent
                }),
            });

            const result = await response.json();

            toast({
                title: result.passed ? "¡Aprobado!" : "Reprobado",
                description: `Puntuación: ${result.score}% (${result.correctAnswers}/${result.totalQuestions} correctas)`,
                variant: result.passed ? "default" : "destructive",
            });

            setProtectionActive(false);
        } catch (error) {
            toast({
                title: "Error",
                description: "Error al enviar la evaluación",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!currentAttempt) {
        return (
            <div className="text-center py-12">
                <Shield className="mx-auto h-16 w-16 text-blue-600 mb-4" />
                <h2 className="text-2xl font-bold mb-4">Evaluación: {evaluation?.title}</h2>
                <p className="text-gray-600 mb-6">{evaluation?.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <Clock className="h-8 w-8 text-blue-600 mb-2" />
                            <p className="font-semibold">Tiempo límite</p>
                            <p>{evaluation?.time_limit || 'Sin límite'} minutos</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
                            <p className="font-semibold">Puntuación mínima</p>
                            <p>{evaluation?.passing_score}%</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <AlertTriangle className="h-8 w-8 text-yellow-600 mb-2" />
                            <p className="font-semibold">Intentos</p>
                            <p>{currentAttempt?.attempt_number || 1} de {evaluation?.max_attempts}</p>
                        </CardContent>
                    </Card>
                </div>

                <Button onClick={startEvaluation} size="lg">
                    <Play className="mr-2" size={20} />
                    Iniciar Evaluación
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header con temporizador */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">{evaluation?.title}</h2>
                            <p className="text-blue-700">En progreso - Protección anti-copia activada</p>
                        </div>

                        {timeLeft > 0 && (
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-600">
                                    {formatTime(timeLeft)}
                                </div>
                                <p className="text-sm text-red-600">Tiempo restante</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Barra de progreso */}
            <div className="flex items-center space-x-4">
                <Progress
                    value={(Object.keys(userAnswers).length / questions.length) * 100}
                    className="flex-1"
                />
                <span className="text-sm text-gray-600">
                    {Object.keys(userAnswers).length} / {questions.length}
                </span>
            </div>

            {/* Preguntas */}
            <div className="space-y-6">
                {questions.map((question, index) => (
                    <Card key={question.id} className="relative">
                        <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                            Pregunta {index + 1} - {question.points} punto(s)
                        </div>

                        <CardHeader>
                            <CardTitle className="text-lg">{question.question_text}</CardTitle>
                        </CardHeader>

                        <CardContent>
                            {question.question_type === 'multiple-choice' ? (
                                <RadioGroup
                                    value={userAnswers[question.id]?.[0] || ''}
                                    onValueChange={(value) => handleAnswerChange(question.id, value, false)}
                                >
                                    {question.options.map((option: any) => (
                                        <div key={option.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                                            <RadioGroupItem value={option.id} id={option.id} />
                                            <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                                                {option.option_text}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            ) : (
                                <div className="space-y-2">
                                    {question.options.map((option: any) => (
                                        <div key={option.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                                            <Checkbox
                                                checked={userAnswers[question.id]?.includes(option.id) || false}
                                                onCheckedChange={(checked) =>
                                                    handleAnswerChange(question.id, option.id, true)
                                                }
                                            />
                                            <Label className="flex-1 cursor-pointer">
                                                {option.option_text}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Botón de enviar */}
            <div className="fixed bottom-6 right-6">
                <Button
                    onClick={() => submitEvaluation(Math.floor((Date.now() - startTime) / 1000))}
                    disabled={isSubmitting || Object.keys(userAnswers).length !== questions.length}
                    size="lg"
                >
                    {isSubmitting ? "Enviando..." : "Finalizar Evaluación"}
                </Button>
            </div>
        </div>
    );
}