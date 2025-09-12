'use client';

import { useProgress } from '@/contexts/ProgressContext';

export function useCourseProgress(courseId: string) {
  const { getCourseProgress, completeModule } = useProgress();
  const progress = getCourseProgress(courseId);

  const completeModuleWithProgress = async (moduleId: string, timeSpent: number = 120) => {
    return completeModule(courseId, moduleId, timeSpent);
  };

  return {
    completed: progress.completed,
    total: progress.total,
    percentage: progress.percentage,
    completeModule: completeModuleWithProgress
  };
}