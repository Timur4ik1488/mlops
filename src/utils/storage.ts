import { UserProgress } from '../types';

const STORAGE_KEY = 'uncflow_ml_academy_progress_v1';

const defaultProgress: UserProgress = {
  completedSteps: [],
  activeStepId: 1,
  quizAnswers: {},
  soundEnabled: true,
  score: 0,
};

export const loadProgress = (): UserProgress => {
  if (typeof window === 'undefined') return defaultProgress;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress;
    const parsed = JSON.parse(raw);
    return {
      ...defaultProgress,
      ...parsed,
    };
  } catch {
    return defaultProgress;
  }
};

export const saveProgress = (progress: UserProgress): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress to localStorage', e);
  }
};

export const clearProgress = (): UserProgress => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  return defaultProgress;
};
