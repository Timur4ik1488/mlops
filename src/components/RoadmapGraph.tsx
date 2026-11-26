import React from 'react';
import { RoadmapStep, StepStatus } from '../types';
import { sound } from '../utils/sound';
import {
  ShieldAlert,
  Cpu,
  Binary,
  GitBranch,
  Sparkles,
  Activity,
  Network,
  Flame,
  Minimize2,
  Server,
  CheckCircle2,
  Lock,
  ArrowRight,
  Clock
} from 'lucide-react';

interface RoadmapGraphProps {
  steps: RoadmapStep[];
  completedSteps: number[];
  activeStepId: number | null;
  onSelectStep: (stepId: number) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  ShieldAlert,
  Cpu,
  Binary,
  GitBranch,
  Sparkles,
  Activity,
  Network,
  Flame,
  Minimize2,
  Server,
};

const CATEGORY_NAMES: Record<string, { label: string; color: string }> = {
  core: { label: 'Базовый ML', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  stream1: { label: 'Поток 1: Код', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  stream2: { label: 'Поток 2: Метаданные', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  fusion: { label: 'Late Fusion', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  prod: { label: 'Production', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
};

export const RoadmapGraph: React.FC<RoadmapGraphProps> = ({
  steps,
  completedSteps,
  activeStepId,
  onSelectStep,
}) => {
  const getStepStatus = (stepId: number): StepStatus => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (stepId === 1 || completedSteps.includes(stepId - 1)) return 'available';
    return 'locked';
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Title & Introduction */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          ИНТЕРАКТИВНЫЙ РОАДМАП: 10 ШАГОВ К ПРОДАКШЕНУ
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Двухпоточная нейросеть для <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">AppSec и фильтрации шума</span>
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Пройди путь от математики одного нейрона до квантованного C++ микросервиса на Node.js. 
          Каждый шаг содержит глубокую теорию, формулы с разбором, чистый код и живую интерактивную песочницу.
        </p>
      </div>

      {/* Nodes Journey Flow */}
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {steps.map((step, idx) => {
            const status = getStepStatus(step.id);
            const isCompleted = status === 'completed';
            const isAvailable = status === 'available';
            const isLocked = status === 'locked';
            const isCurrent = activeStepId === step.id;

            const Icon = ICON_MAP[step.iconName] || ShieldAlert;
            const cat = CATEGORY_NAMES[step.category] || CATEGORY_NAMES.core;

            return (
              <div
                key={step.id}
                onClick={() => {
                  sound.playNodeSelect();
                  onSelectStep(step.id);
                }}
                className={`group relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-cyan-400/80 shadow-[0_0_30px_rgba(56,189,248,0.25)]'
                    : isCompleted
                    ? 'bg-slate-900/90 border-emerald-500/40 hover:border-emerald-500/70 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                    : isAvailable
                    ? 'bg-slate-900/60 border-slate-700 hover:border-cyan-500/60 hover:shadow-[0_0_20px_rgba(56,189,248,0.15)]'
                    : 'bg-slate-950/60 border-slate-900 opacity-60 hover:opacity-80'
                }`}
              >
                {/* Step Top Bar */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center ${
                        isCompleted
                          ? 'bg-emerald-500 text-slate-950'
                          : isAvailable
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {step.id}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider font-semibold ${cat.color}`}>
                        {cat.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {step.duration}
                      </span>
                      {isCompleted && (
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Сдано
                        </span>
                      )}
                      {isLocked && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-3.5 mb-2">
                    <div className={`p-3 rounded-xl border shrink-0 transition-transform group-hover:scale-105 ${
                      isCompleted
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : isAvailable
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                        : 'bg-slate-800/40 border-slate-800 text-slate-500'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-100 text-base group-hover:text-cyan-300 transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {step.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono text-[11px]">
                    5 вкладок: теория, формулы, код, песочница, тест
                  </span>
                  <span className="font-semibold text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    {isCompleted ? 'Повторить урок' : 'Начать изучение'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
