import React, { useState } from 'react';
import { sound } from '../../utils/sound';
import { GitBranch, Sparkles, RefreshCw } from 'lucide-react';

export const Step4LSTMSimulator: React.FC = () => {
  const [fGate, setFGate] = useState<number>(0.85); // Forget gate (0..1)
  const [iGate, setIGate] = useState<number>(0.65); // Input gate (0..1)
  const [cCand, setCCand] = useState<number>(-1.2); // Candidate memory (-2..+2)
  const [prevC, setPrevC] = useState<number>(2.0);  // Previous long-term memory
  const [oGate, setOGate] = useState<number>(0.90); // Output gate (0..1)

  // Calculations
  // Kept old memory: f_t * C_{t-1}
  const keptMem = fGate * prevC;
  // New added info: i_t * C_cand
  const addedMem = iGate * cCand;
  // Updated memory cell C_t
  const newC = keptMem + addedMem;
  // Hidden state output: h_t = o_t * tanh(C_t)
  const hiddenState = oGate * Math.tanh(newC);

  const applyPreset = (fg: number, ig: number, cc: number, pc: number, og: number) => {
    sound.playClick();
    setFGate(fg);
    setIGate(ig);
    setCCand(cc);
    setPrevC(pc);
    setOGate(og);
  };

  return (
    <div className="space-y-6 text-sm">
      <div className="bg-cyber-card/80 border border-cyber-border rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="font-semibold text-slate-100 flex items-center gap-2 text-base">
              <GitBranch className="w-4 h-4 text-emerald-400" />
              Интерактивный симулятор шины долговременной памяти Bi-LSTM
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Посмотри, как аддитивное обновление C_t = f_t · C_(t-1) + i_t · C̃_t защищает сеть от затухания градиента.
            </p>
          </div>
        </div>

        {/* Real-world AppSec Presets */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs text-slate-400">Сценарии в коде:</span>
          <button
            onClick={() => applyPreset(0.05, 0.2, 0.0, 2.5, 0.3)}
            className="px-2.5 py-1 text-xs rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 transition"
          >
            ✂️ Закрытие скобки &apos;&#125;&apos; (Forget Gate = 0.05: Сброс Scope)
          </button>
          <button
            onClick={() => applyPreset(0.95, 0.9, 1.8, 0.8, 0.95)}
            className="px-2.5 py-1 text-xs rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition"
          >
            🚨 Обнаружен уязвимый Sink (Input Gate = 0.9: Полная запись)
          </button>
          <button
            onClick={() => applyPreset(0.9, 0.1, 0.1, 2.0, 0.8)}
            className="px-2.5 py-1 text-xs rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
          >
            ⚪ Нейтральный токен синтаксиса (Пропуск без изменений)
          </button>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Gates Column */}
          <div className="space-y-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Вентили управления (Gates)
            </h5>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Forget Gate ($f_t$):</span>
                <span className="font-mono text-cyan-300 font-bold">{fGate.toFixed(2)} ({(fGate * 100).toFixed(0)}%)</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={fGate}
                onChange={(e) => setFGate(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[10px] text-slate-500">Сколько старой информации из C_(t-1) сохранить</span>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Input Gate ($i_t$):</span>
                <span className="font-mono text-cyan-300 font-bold">{iGate.toFixed(2)} ({(iGate * 100).toFixed(0)}%)</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={iGate}
                onChange={(e) => setIGate(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[10px] text-slate-500">Доля записи нового токена в память</span>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Output Gate ($o_t$):</span>
                <span className="font-mono text-cyan-300 font-bold">{oGate.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={oGate}
                onChange={(e) => setOGate(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[10px] text-slate-500">Фильтрация скрытого состояния $h_t$</span>
            </div>
          </div>

          {/* Memory Candidates Column */}
          <div className="space-y-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-purple-400">
              Состояния памяти (Memory Bus)
            </h5>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Предыдущая память (C_(t-1)):</span>
                <span className="font-mono text-purple-300 font-bold">{prevC.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-3"
                max="3"
                step="0.1"
                value={prevC}
                onChange={(e) => setPrevC(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Кандидат нового токена (C̃_t):</span>
                <span className="font-mono text-purple-300 font-bold">{cCand.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={cCand}
                onChange={(e) => setCCand(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>

            {/* Visual Bus Diagram Card */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Старая память:</span>
                <span className="text-slate-200">{fGate.toFixed(2)} × {prevC.toFixed(2)} = <strong className="text-cyan-300">{keptMem.toFixed(3)}</strong></span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Новая добавка:</span>
                <span className="text-slate-200">{iGate.toFixed(2)} × {cCand.toFixed(2)} = <strong className="text-purple-300">{addedMem.toFixed(3)}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Calculation Results */}
        <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Аддитивное обновление шины памяти $C_t$:
              </div>
              <div className="text-lg font-mono font-bold text-slate-100 flex items-center gap-2">
                <span>C_t = {keptMem.toFixed(2)} + ({addedMem.toFixed(2)}) =</span>
                <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  {newC.toFixed(3)}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Градиент dC_t / dC_(t-1) = f_t = {fGate.toFixed(2)}. Сложение не дает градиенту затухнуть!
              </p>
            </div>

            {/* Hidden State Output */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 font-mono">Скрытое состояние $h_t$:</div>
                <div className="text-2xl font-bold font-mono text-cyan-300">
                  {hiddenState.toFixed(4)}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  h_t = {oGate.toFixed(2)} × tanh({newC.toFixed(2)})
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
                  Math.abs(hiddenState) > 0.6 ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  {Math.abs(hiddenState) > 0.6 ? 'Высокий сигнал' : 'Фоновый сигнал'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
