import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { RoadmapGraph } from './components/RoadmapGraph';
import { StepModal } from './components/StepModal';
import { roadmapSteps, getStepById } from './data/roadmapData';
import { loadProgress, saveProgress, clearProgress } from './utils/storage';
import { sound } from './utils/sound';
import { UserProgress } from './types';
import confetti from 'canvas-confetti';
import { Shield, Sparkles, Terminal, BookOpen, ExternalLink, Github } from 'lucide-react';

export const App: React.FC = () => {
  const [progress, setProgress] = useState<UserProgress>(loadProgress());
  const [modalStepId, setModalStepId] = useState<number | null>(null);

  // Sync sound manager with progress setting
  useEffect(() => {
    sound.setMuted(!progress.soundEnabled);
  }, [progress.soundEnabled]);

  // Save progress on update
  const updateProgress = (updater: (prev: UserProgress) => UserProgress) => {
    setProgress((prev) => {
      const updated = updater(prev);
      saveProgress(updated);
      return updated;
    });
  };

  const handleToggleSound = () => {
    updateProgress((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  };

  const handleResetProgress = () => {
    const fresh = clearProgress();
    setProgress(fresh);
    setModalStepId(null);
  };

  const handleOpenStep = (stepId: number) => {
    setModalStepId(stepId);
    updateProgress((prev) => ({
      ...prev,
      activeStepId: stepId,
    }));
  };

  const handleCloseModal = () => {
    setModalStepId(null);
  };

  const handleNextStep = () => {
    if (modalStepId && modalStepId < roadmapSteps.length) {
      handleOpenStep(modalStepId + 1);
    }
  };

  const handlePrevStep = () => {
    if (modalStepId && modalStepId > 1) {
      handleOpenStep(modalStepId - 1);
    }
  };

  const handleMarkCompleted = (stepId: number) => {
    updateProgress((prev) => {
      const completed = prev.completedSteps.includes(stepId)
        ? prev.completedSteps
        : [...prev.completedSteps, stepId];

      // If all 10 are completed, launch full celebratory confetti!
      if (completed.length === roadmapSteps.length && !prev.completedSteps.includes(stepId)) {
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.5 },
          });
        }, 300);
      }

      return {
        ...prev,
        completedSteps: completed,
      };
    });
  };

  const handleAnswerQuestion = (qId: string, optIdx: number) => {
    updateProgress((prev) => ({
      ...prev,
      quizAnswers: {
        ...prev.quizAnswers,
        [qId]: optIdx,
      },
    }));
  };

  const activeModalStep = modalStepId ? getStepById(modalStepId) : null;

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 cyber-grid flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <Header
        completedCount={progress.completedSteps.length}
        totalCount={roadmapSteps.length}
        soundEnabled={progress.soundEnabled}
        onToggleSound={handleToggleSound}
        onResetProgress={handleResetProgress}
      />

      {/* Main Roadmap Area */}
      <main className="flex-1 pb-16">
        <RoadmapGraph
          steps={roadmapSteps}
          completedSteps={progress.completedSteps}
          activeStepId={modalStepId || progress.activeStepId}
          onSelectStep={handleOpenStep}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-cyber-border py-8 bg-slate-950/80 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-slate-300 font-semibold">
              uncflow ML Academy
            </span>
            <span>— Интерактивный учебник AppSec AI</span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span>React 18</span>
            <span>•</span>
            <span>Tailwind CSS</span>
            <span>•</span>
            <span>PyTorch ➔ ONNX</span>
            <span>•</span>
            <span>Web Audio API</span>
          </div>
        </div>
      </footer>

      {/* Centered Step Modal Dialog */}
      {activeModalStep && (
        <StepModal
          step={activeModalStep}
          isOpen={!!activeModalStep}
          isCompleted={progress.completedSteps.includes(activeModalStep.id)}
          totalSteps={roadmapSteps.length}
          quizAnswers={progress.quizAnswers}
          onClose={handleCloseModal}
          onNext={handleNextStep}
          onPrev={handlePrevStep}
          onMarkCompleted={handleMarkCompleted}
          onAnswerQuestion={handleAnswerQuestion}
        />
      )}
    </div>
  );
};
