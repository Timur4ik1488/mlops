export type StepStatus = 'completed' | 'in_progress' | 'available' | 'locked';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface PracticalTask {
  title: string;
  description: string;
  hints?: string[];
  solution: string;
  explanation: string;
}

export interface RoadmapStep {
  id: number;
  title: string;
  subtitle: string;
  duration: string;
  iconName: string;
  category: 'core' | 'stream1' | 'stream2' | 'fusion' | 'prod';
  overview: {
    problemTitle: string;
    problemDescription: string;
    solutionTitle: string;
    solutionDescription: string;
    deepExplanation: string[];
    realWorldPitfalls: string[];
    productionTip: string;
  };
  mathematics: {
    headline: string;
    summary: string;
    formulas: {
      name: string;
      latex: string;
      meaning: string;
      variables: { symbol: string; desc: string }[];
    }[];
    numericWalkthrough: {
      title: string;
      inputData: string;
      calculationSteps: string[];
      result: string;
      engineeringInsight: string;
    };
  };
  code: {
    language: 'python' | 'typescript';
    filename: string;
    description: string;
    snippet: string;
    lineExplanations: { lines: string; comment: string }[];
    architectureNote: string;
  };
  quiz: {
    questions: QuizQuestion[];
    task: PracticalTask;
  };
}

export interface UserProgress {
  completedSteps: number[];
  activeStepId: number | null;
  quizAnswers: Record<string, number>;
  soundEnabled: boolean;
  score: number;
}
