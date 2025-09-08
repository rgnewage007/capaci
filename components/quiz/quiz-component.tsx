// components/quiz/quiz-component.tsx (versión alternativa)
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Award } from 'lucide-react';

interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    points: number;
}

interface QuizComponentProps {
    quiz: {
        id: string;
        title: string;
        description: string;
        questions: QuizQuestion[];
        timeLimit?: number;
        passingScore: number;
    };
    onComplete: (score: number, timeSpent: number) => void;
    onCancel: () => void;
}

// Componente de radio button personalizado
const CustomRadio = ({
    id,
    value,
    checked,
    onChange,
    label
}: {
    id: string;
    value: string;
    checked: boolean;
    onChange: (value: string) => void;
    label: string;
}) => {
    return (
        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
                type="radio"
                id={id}
                name="quiz-option"
                value={value}
                checked={checked}
                onChange={(e) => onChange(e.target.value)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <Label htmlFor={id} className="flex-1 cursor-pointer">
                {label}
            </Label>
        </div>
    );
};

export default function QuizComponent({ quiz, onComplete, onCancel }: QuizComponentProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<number[]>(Array(quiz.questions.length).fill(-1));
    const [timeSpent, setTimeSpent] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const currentQ = quiz.questions[currentQuestion];

    const handleAnswerSelect = (answerIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = answerIndex;
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const calculateScore = () => {
        let totalScore = 0;
        answers.forEach((answer, index) => {
            if (answer === quiz.questions[index].correctAnswer) {
                totalScore += quiz.questions[index].points;
            }
        });
        return totalScore;
    };

    const handleSubmit = () => {
        const finalScore = calculateScore();
        setScore(finalScore);
        setIsSubmitted(true);
        onComplete(finalScore, timeSpent);
    };

    // Timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeSpent(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (isSubmitted) {
        const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
        const percentage = (score / totalPoints) * 100;
        const passed = percentage >= quiz.passingScore;

        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-center">Resultados del Quiz</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center">
                        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {passed ? <CheckCircle size={32} /> : <Award size={32} />}
                        </div>
                        <h3 className="text-xl font-bold mt-4">{passed ? '¡Felicidades!' : 'Intenta de nuevo'}</h3>
                        <p className="text-gray-600">
                            {passed ? 'Has aprobado el quiz.' : `Necesitas al menos ${quiz.passingScore}% para aprobar.`}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold">{score}/{totalPoints}</p>
                            <p className="text-sm text-gray-600">Puntuación</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold">{Math.round(percentage)}%</p>
                            <p className="text-sm text-gray-600">Porcentaje</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Tiempo empleado</span>
                            <span>{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
                        </div>
                        <Progress value={(timeSpent / (quiz.timeLimit || 300)) * 100} />
                    </div>

                    <Button onClick={onCancel} className="w-full">
                        Continuar
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>{quiz.title}</CardTitle>
                    <div className="flex items-center text-sm text-gray-600">
                        <Clock className="mr-1" size={16} />
                        <span>{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
                    </div>
                </div>
                <p className="text-sm text-gray-600">{quiz.description}</p>
                <Progress value={((currentQuestion + 1) / quiz.questions.length) * 100} />
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium mb-4">
                        Pregunta {currentQuestion + 1} de {quiz.questions.length}: {currentQ.question}
                    </h3>

                    <div className="space-y-3">
                        {currentQ.options.map((option, index) => (
                            <CustomRadio
                                key={index}
                                id={`option-${currentQuestion}-${index}`}
                                value={index.toString()}
                                checked={answers[currentQuestion] === index}
                                onChange={(value) => handleAnswerSelect(parseInt(value))}
                                label={option}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex justify-between">
                    <Button
                        onClick={handlePrevious}
                        disabled={currentQuestion === 0}
                        variant="outline"
                    >
                        Anterior
                    </Button>

                    {currentQuestion === quiz.questions.length - 1 ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={answers[currentQuestion] === -1}
                        >
                            Finalizar Quiz
                        </Button>
                    ) : (
                        <Button
                            onClick={handleNext}
                            disabled={answers[currentQuestion] === -1}
                        >
                            Siguiente
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}