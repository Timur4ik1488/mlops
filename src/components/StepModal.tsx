import React, { useState, useEffect } from 'react';
import { RoadmapStep } from '../types';
import { sound } from '../utils/sound';
import { CodeBlock } from './CodeBlock';
import { MathBlock } from './MathBlock';
import { QuizWidget } from './QuizWidget';
import confetti from 'canvas-confetti';
import {
  X,
  Lightbulb,
  Sigma,
  Code2,
  Gamepad2,
  TestTube2,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertOctagon,
  Sparkles
} from 'lucide-react';

// Step interactive widgets
import { Step1NeuronCalculator } from './widgets/Step1NeuronCalculator';
import { Step2ActivationComparator } from './widgets/Step2ActivationComparator';
import { Step3EmbeddingCosine } from './widgets/Step3EmbeddingCosine';
import { Step4LSTMSimulator } from './widgets/Step4LSTMSimulator';
import { Step5AttentionInspector } from './widgets/Step5AttentionInspector';
import { Step6EntropyCalculator } from './widgets/Step6EntropyCalculator';
import { Step7ArchitectureViewer } from './widgets/Step7ArchitectureViewer';
import { Step8FocalLossSimulator } from './widgets/Step8FocalLossSimulator';
import { Step9QuantizationCalculator } from './widgets/Step9QuantizationCalculator';
import { Step10ProductionScanner } from './widgets/Step10ProductionScanner';

interface StepModalProps {
  step: RoadmapStep;
  isOpen: boolean;
  isCompleted: boolean;
  totalSteps: number;
  quizAnswers: Record<string, number>;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onMarkCompleted: (stepId: number) => void;
  onAnswerQuestion: (questionId: string, optionIdx: number) => void;
}

type TabType = 'overview' | 'math' | 'code' | 'sandbox' | 'quiz';

export const StepModal: React.FC<StepModalProps> = ({
  step,
  isOpen,
  isCompleted,
  totalSteps,
  quizAnswers,
  onClose,
  onNext,
  onPrev,
  onMarkCompleted,
  onAnswerQuestion,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Reset tab on step change
  useEffect(() => {
    setActiveTab('overview');
  }, [step.id]);

  // Handle keyboard shortcuts (Esc to close, Arrow keys to navigate)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sound.playClick();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#38bdf8', '#a855f7'],
    });
  };

  const handleComplete = () => {
    sound.playSuccess();
    triggerConfetti();
    onMarkCompleted(step.id);
  };

  const handleTabSwitch = (tab: TabType) => {
    sound.playTabSwitch();
    setActiveTab(tab);
  };

  // Render current interactive sandbox widget
  const renderSandboxWidget = () => {
    switch (step.id) {
      case 1:
        return <Step1NeuronCalculator />;
      case 2:
        return <Step2ActivationComparator />;
      case 3:
        return <Step3EmbeddingCosine />;
      case 4:
        return <Step4LSTMSimulator />;
      case 5:
        return <Step5AttentionInspector />;
      case 6:
        return <Step6EntropyCalculator />;
      case 7:
        return <Step7ArchitectureViewer />;
      case 8:
        return <Step8FocalLossSimulator />;
      case 9:
        return <Step9QuantizationCalculator />;
      case 10:
        return <Step10ProductionScanner />;
      default:
        return <Step1NeuronCalculator />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 lg:p-8 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#04070d]/85 backdrop-blur-md transition-opacity"
        onClick={() => {
          sound.playClick();
          onClose();
        }}
      />

      {/* Wide Centered Modal Window */}
      <div className="relative w-full max-w-5xl bg-[#080d17] border border-cyber-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900/90 border-b border-cyber-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 font-mono font-bold text-sm flex items-center justify-center border border-cyan-500/40">
              {step.id}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono font-semibold tracking-wider text-cyan-400">
                  Шаг {step.id} из {totalSteps}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400 font-mono">{step.duration}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100">
                {step.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCompleted && (
              <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Шаг пройден
              </span>
            )}
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Закрыть окно (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 5 Horizontal Tabs */}
        <div className="px-6 py-2 bg-slate-950/80 border-b border-cyber-border flex items-center gap-1 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => handleTabSwitch('overview')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'overview'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cyber-glow-cyan'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-cyan-400" />
            <span>💡 Простыми словами</span>
          </button>

          <button
            onClick={() => handleTabSwitch('math')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'math'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 cyber-glow-purple'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sigma className="w-4 h-4 text-purple-400" />
            <span>📐 Глубокая математика</span>
          </button>

          <button
            onClick={() => handleTabSwitch('code')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'code'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cyber-glow-cyan'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>💻 Код и реализация</span>
          </button>

          <button
            onClick={() => handleTabSwitch('sandbox')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'sandbox'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cyber-glow-emerald'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-emerald-400" />
            <span>🎮 Интерактивная песочница</span>
          </button>

          <button
            onClick={() => handleTabSwitch('quiz')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'quiz'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <TestTube2 className="w-4 h-4 text-amber-400" />
            <span>🧪 Тест и Практика</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6 text-sm">
              {/* Problem vs Solution cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <AlertOctagon className="w-4 h-4" />
                    <span>{step.overview.problemTitle}</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {step.overview.problemDescription}
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{step.overview.solutionTitle}</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {step.overview.solutionDescription}
                  </p>
                </div>
              </div>

              {/* Deep Intuitive Explanation */}
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Углубленный разбор концепции и физический смысл:
                </h4>
                <div className="space-y-2.5">
                  {step.overview.deepExplanation.map((text, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                      <span className="text-cyan-400 font-bold">▶</span>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real World Pitfalls */}
              {step.overview.realWorldPitfalls.length > 0 && (
                <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2.5">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    ⚠️ Реальные грабли и ловушки продакшена:
                  </h5>
                  <div className="space-y-1.5">
                    {step.overview.realWorldPitfalls.map((pitfall, idx) => (
                      <div key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                        <span className="text-amber-400">•</span>
                        <span>{pitfall}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Production Tip */}
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-200 flex items-start gap-2.5">
                <span className="text-cyan-400 font-bold shrink-0">🚀 Production Insight:</span>
                <span className="leading-relaxed">{step.overview.productionTip}</span>
              </div>
            </div>
          )}

          {/* Tab 2: Mathematics */}
          {activeTab === 'math' && (
            <MathBlock
              headline={step.mathematics.headline}
              summary={step.mathematics.summary}
              formulas={step.mathematics.formulas}
              numericWalkthrough={step.mathematics.numericWalkthrough}
            />
          )}

          {/* Tab 3: Code */}
          {activeTab === 'code' && (
            <CodeBlock
              language={step.code.language}
              filename={step.code.filename}
              snippet={step.code.snippet}
              lineExplanations={step.code.lineExplanations}
              architectureNote={step.code.architectureNote}
            />
          )}

          {/* Tab 4: Interactive Sandbox */}
          {activeTab === 'sandbox' && renderSandboxWidget()}

          {/* Tab 5: Quiz & Practice */}
          {activeTab === 'quiz' && (
            <QuizWidget
              stepId={step.id}
              questions={step.quiz.questions}
              task={step.quiz.task}
              savedAnswers={quizAnswers}
              onAnswerQuestion={onAnswerQuestion}
            />
          )}
        </div>

        {/* Modal Bottom Navigation Bar */}
        <div className="px-6 py-4 bg-slate-900/90 border-t border-cyber-border flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onPrev();
              }}
              disabled={step.id <= 1}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Назад
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onNext();
              }}
              disabled={step.id >= totalSteps}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 transition"
            >
              Вперед
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleComplete}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                isCompleted
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                  : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold shadow-lg shadow-emerald-500/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isCompleted ? 'Пройдено (Нажми для повтора салюта)' : 'Отметить как пройденное'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
