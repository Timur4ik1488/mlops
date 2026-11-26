import React, { useState } from 'react';
import { sound } from '../../utils/sound';
import { Minimize2, Sparkles, HardDrive, Cpu } from 'lucide-react';

export const Step9QuantizationCalculator: React.FC = () => {
  const [floatVal, setFloatVal] = useState<number>(1.45);
  const [minVal, setMinVal] = useState<number>(-2.5);
  const [maxVal, setMaxVal] = useState<number>(2.5);

  // Scale S = (max - min) / 255
  const range = maxVal - minVal;
  const scale = range > 0 ? range / 255 : 0.01;
  // Zero-point Z = round(-min / S) - 128
  const zeroPoint = Math.round(-minVal / scale) - 128;

  // Quantized byte q = round(floatVal / S) + Z, clamped to [-128, 127]
  const rawQ = Math.round(floatVal / scale) + zeroPoint;
  const qByte = Math.max(-128, Math.min(127, rawQ));

  // De-quantized recovered value: x_hat = S * (q - Z)
  const recoveredVal = scale * (qByte - zeroPoint);
  const absoluteError = Math.abs(floatVal - recoveredVal);

  // Binary byte representation of INT8
  const unsignedByte = (qByte + 256) % 256;
  const binaryString = unsignedByte.toString(2).padStart(8, '0');

  const setPreset = (f: number, mn: number, mx: number) => {
    sound.playClick();
    setFloatVal(f);
    setMinVal(mn);
    setMaxVal(mx);
  };

  return (
    <div className="space-y-6 text-sm">
      <div className="bg-cyber-card/80 border border-cyber-border rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="font-semibold text-slate-100 flex items-center gap-2 text-base">
              <Minimize2 className="w-4 h-4 text-cyan-400" />
              Калькулятор динамического INT8 квантования весов
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Сжатие 32-битного вещественного числа FP32 (4 байта) в 8-битный знаковый байт INT8 (1 байт) с мгновенным расчетом погрешности.
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs text-slate-400">Тестовые числа:</span>
          <button
            onClick={() => setPreset(1.45, -2.5, 2.5)}
            className="px-2.5 py-1 text-xs rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition"
          >
            Вес слоя z = 1.45 (Диапазон [-2.5, 2.5])
          </button>
          <button
            onClick={() => setPreset(-0.825, -2.0, 2.0)}
            className="px-2.5 py-1 text-xs rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition"
          >
            Отрицательный вес z = -0.825
          </button>
          <button
            onClick={() => setPreset(3.14159, -4.0, 4.0)}
            className="px-2.5 py-1 text-xs rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition"
          >
            Число Пи: 3.14159
          </button>
        </div>

        {/* Sliders and Range Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex justify-between text-xs text-slate-300">
              <span className="font-semibold text-slate-200">Вещественный вес FP32 ($x$):</span>
              <span className="font-mono text-cyan-300 font-bold text-sm">{floatVal.toFixed(4)}</span>
            </div>
            <input
              type="range"
              min={minVal}
              max={maxVal}
              step="0.01"
              value={floatVal}
              onChange={(e) => setFloatVal(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="text-[11px] text-slate-500 font-mono">
              В памяти FP32 занимает 32 бита (4 байта) по стандарту IEEE 754
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="text-xs font-semibold uppercase text-purple-400 tracking-wider block">
              Динамический диапазон слоя [x_min, x_max]:
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">x_min:</label>
                <input
                  type="number"
                  step="0.5"
                  value={minVal}
                  onChange={(e) => setMinVal(parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-slate-200"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">x_max:</label>
                <input
                  type="number"
                  step="0.5"
                  value={maxVal}
                  onChange={(e) => setMaxVal(parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-slate-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quantization Metrics & Formula */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-xs font-mono">
            <div className="text-slate-500 uppercase text-[10px]">Шаг сетки (Scale S):</div>
            <div className="text-slate-200 font-bold mt-1 text-sm">{scale.toFixed(6)}</div>
            <div className="text-[10px] text-slate-500">S = ({maxVal} - {minVal}) / 255</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-xs font-mono">
            <div className="text-slate-500 uppercase text-[10px]">Смещение (Zero-Point Z):</div>
            <div className="text-slate-200 font-bold mt-1 text-sm">{zeroPoint}</div>
            <div className="text-[10px] text-slate-500">Z = round(-x_min / S)</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-xs font-mono">
            <div className="text-purple-400 uppercase text-[10px] font-bold">Сжатый байт INT8 ($q$):</div>
            <div className="text-purple-300 font-bold mt-1 text-sm">{qByte} ∈ [-128, 127]</div>
            <div className="text-[10px] text-slate-500">Биты: {binaryString}</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-xs font-mono">
            <div className="text-emerald-400 uppercase text-[10px] font-bold">Погрешность:</div>
            <div className="text-emerald-300 font-bold mt-1 text-sm">{absoluteError.toFixed(6)}</div>
            <div className="text-[10px] text-slate-500">&lt; S/2 = {(scale / 2).toFixed(6)}</div>
          </div>
        </div>

        {/* Memory Compression Banner */}
        <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-slate-100 text-sm">
                  Экономия оперативной памяти: 4x (Ровно 75%)
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  PyTorch FP32: <span className="text-rose-400 line-through">59.2 МБ</span> ➔ ONNX INT8: <span className="text-emerald-400 font-bold">14.8 МБ</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>AVX-512 VNNI Ускорение: 3.8×</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
