'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '@/lib/axios-auth';

interface ProgressState {
  courses: {
    [courseId: string]: {
      completedModules: number;
      totalModules: number;
      percentage: number;
      modules: {
        [moduleId: string]: {
          completed: boolean;
          timeSpent: number;
        };
      };
    };
  };
}

type ProgressAction =
  | { type: 'INITIALIZE_PROGRESS'; payload: { courseId: string; completed: number; total: number; modules: any[] } }
  | { type: 'COMPLETE_MODULE'; payload: { courseId: string; moduleId: string; timeSpent: number } }
  | { type: 'UPDATE_PROGRESS'; payload: { courseId: string; completed: number; total: number } };

const ProgressContext = createContext<{
  state: ProgressState;
  dispatch: React.Dispatch<ProgressAction>;
  completeModule: (courseId: string, moduleId: string, timeSpent?: number) => Promise<void>;
  getCourseProgress: (courseId: string) => { completed: number; total: number; percentage: number };
} | null>(null);

function progressReducer(state: ProgressState, action: ProgressAction): ProgressState {
  switch (action.type) {
    case 'INITIALIZE_PROGRESS':
      return {
        ...state,
        courses: {
          ...state.courses,
          [action.payload.courseId]: {
            completedModules: action.payload.completed,
            totalModules: action.payload.total,
            percentage: Math.round((action.payload.completed / action.payload.total) * 100),
            modules: action.payload.modules.reduce((acc, module) => ({
              ...acc,
              [module.module_id]: {
                completed: module.status === 'completed',
                timeSpent: module.time_spent || 0
              }
            }), {})
          }
        }
      };

    case 'COMPLETE_MODULE':
      const course = state.courses[action.payload.courseId];
      if (!course) return state;

      const newCompleted = course.modules[action.payload.moduleId]?.completed 
        ? course.completedModules 
        : course.completedModules + 1;

      return {
        ...state,
        courses: {
          ...state.courses,
          [action.payload.courseId]: {
            ...course,
            completedModules: newCompleted,
            percentage: Math.round((newCompleted / course.totalModules) * 100),
            modules: {
              ...course.modules,
              [action.payload.moduleId]: {
                completed: true,
                timeSpent: action.payload.timeSpent
              }
            }
          }
        }
      };

    case 'UPDATE_PROGRESS':
      return {
        ...state,
        courses: {
          ...state.courses,
          [action.payload.courseId]: {
            ...state.courses[action.payload.courseId],
            completedModules: action.payload.completed,
            totalModules: action.payload.total,
            percentage: Math.round((action.payload.completed / action.payload.total) * 100)
          }
        }
      };

    default:
      return state;
  }
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(progressReducer, { courses: {} });

  const completeModule = async (courseId: string, moduleId: string, timeSpent: number = 120) => {
    try {
      // 1. Actualizar UI inmediatamente (optimistic update)
      dispatch({
        type: 'COMPLETE_MODULE',
        payload: { courseId, moduleId, timeSpent }
      });

      // 2. Enviar a la API
      await api.post('/api/progress', {
        courseId,
        moduleId,
        status: 'completed',
        timeSpent
      });

      console.log('✅ Módulo completado y guardado en servidor');

    } catch (error) {
      console.error('❌ Error al completar módulo:', error);
      // Revertir cambios en caso de error
      dispatch({
        type: 'UPDATE_PROGRESS',
        payload: {
          courseId,
          completed: state.courses[courseId]?.completedModules - 1,
          total: state.courses[courseId]?.totalModules
        }
      });
    }
  };

  const getCourseProgress = (courseId: string) => {
    const course = state.courses[courseId];
    return {
      completed: course?.completedModules || 0,
      total: course?.totalModules || 0,
      percentage: course?.percentage || 0
    };
  };

  return (
    <ProgressContext.Provider value={{ state, dispatch, completeModule, getCourseProgress }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress debe ser usado dentro de ProgressProvider');
  }
  return context;
}