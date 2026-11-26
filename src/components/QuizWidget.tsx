import React, { useState } from 'react';
import { sound } from '../utils/sound';
import { QuizQuestion, PracticalTask } from '../types';
import { HelpCircle, CheckCircle2, XCircle, ChevronDown, ChevronUp, Lightbulb, Check } from 'lucide-react';

interface QuizWidgetProps {
  stepId: number;
  questions: QuizQuestion[];
  task: PracticalTask;
  savedAnswers: Record<string, number>;
  onAnswerQuestion: (questionId: string, optionIdx: number) => void;
}

export const QuizWidget: React.FC<QuizWidgetProps> = ({
  stepId,
  questions,
  task,
  savedAnswers,
  onAnswerQuestion,
}) => {
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [showHints, setShowHints] = useState<boolean>(false);

  const handleSelect = (qId: string, optIdx: number, correctIdx: number) => {
    if (optIdx === correctIdx) {
      sound.playSuccess();
    } else {
      sound.playError();
    }
    onAnswerQuestion(qId, optIdx);
  };

  return (
    <div className="space-y-8 text-sm">
      {/* Quiz Questions */}
      <div className="space-y-6">
        <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          Контрольные вопросы для самопроверки:
        </h4>

        {questions.map((q, qIndex) => {
          const selectedAnswer = savedAnswers[q.id];
          const hasAnswered = selectedAnswer !== undefined;
          const isCorrect = selectedAnswer === q.correctAnswer;

          return (
            <div
              key={q.id}
              className={`p-5 rounded-xl border transition-all ${
                hasAnswered
                  ? isCorrect
                    ? 'bg-emerald-500/5 border-emerald-500/30'
                    : 'bg-rose-500/5 border-rose-500/30'
                  : 'bg-[#070b12] border-cyber-border'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="text-xs font-bold font-mono text-cyan-400">
                  Вопрос #{qIndex + 1}
                </span>
                {hasAnswered && (
                  <span
                    className={`flex items-center gap-1 text-xs font-bold ${
                      isCorrect ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Верно!
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" /> Неверно
                      </>
                    )}
                  </span>
                )}
              </div>

              <p className="font-semibold text-slate-200 mb-4 leading-relaxed">
                {q.question}
              </p>

              {/* Options */}
              <div className="space-y-2">
                {q.options.map((opt, optIdx) => {
                  const isThisSelected = selectedAnswer === optIdx;
                  const isThisCorrect = q.correctAnswer === optIdx;

                  let optClass = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';
                  if (hasAnswered) {
                    if (isThisCorrect) {
                      optClass = 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200 font-semibold';
                    } else if (isThisSelected) {
                      optClass = 'bg-rose-500/15 border-rose-500/50 text-rose-200';
                    } else {
                      optClass = 'bg-slate-950 border-slate-900 text-slate-500 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelect(q.id, optIdx, q.correctAnswer)}
                      className={`w-full p-3 rounded-lg border text-left text-xs transition-all flex items-center justify-between gap-3 ${optClass}`}
                    >
                      <span className="leading-relaxed">{opt}</span>
                      {hasAnswered && isThisCorrect && (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation after answer */}
              {hasAnswered && (
                <div className="mt-4 p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <strong className="text-cyan-300">Пояснение эксперта: </strong>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Practical Task */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-cyber-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h4 className="font-bold text-slate-100 text-base">{task.title}</h4>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
            Практическая задача
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {task.description}
        </p>

        {/* Hints */}
        {task.hints && task.hints.length > 0 && (
          <div>
            <button
              onClick={() => {
                sound.playClick();
                setShowHints(!showHints);
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
            >
              {showHints ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {showHints ? 'Скрыть подсказки' : 'Показать математические подсказки'}
            </button>

            {showHints && (
              <div className="mt-2 p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 text-xs text-slate-400 font-mono">
                {task.hints.map((hint, hIdx) => (
                  <div key={hIdx} className="flex items-start gap-2">
                    <span className="text-cyan-400">💡</span>
                    <span>{hint}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Solution Toggle */}
        <div className="pt-2">
          <button
            onClick={() => {
              sound.playClick();
              setShowSolution(!showSolution);
            }}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition flex items-center gap-2"
          >
            {showSolution ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" /> Скрыть подробное решение
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" /> Показать подробное решение и ответ
              </>
            )}
          </button>

          {showSolution && (
            <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
              <div className="text-xs font-mono text-emerald-300 whitespace-pre-line leading-relaxed font-bold">
                {task.solution}
              </div>
              <div className="text-xs text-slate-400 pt-2 border-t border-slate-800/80 leading-relaxed">
                <strong className="text-slate-300">Инженерный вывод: </strong>
                {task.explanation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
