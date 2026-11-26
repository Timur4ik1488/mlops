import React from 'react';
import { Sigma, HelpCircle, CheckCircle2 } from 'lucide-react';

interface MathFormula {
  name: string;
  latex: string;
  meaning: string;
  variables: { symbol: string; desc: string }[];
}

interface MathBlockProps {
  headline: string;
  summary: string;
  formulas: MathFormula[];
  numericWalkthrough: {
    title: string;
    inputData: string;
    calculationSteps: string[];
    result: string;
    engineeringInsight: string;
  };
}

export const MathBlock: React.FC<MathBlockProps> = ({
  headline,
  summary,
  formulas,
  numericWalkthrough,
}) => {
  return (
    <div className="space-y-6 text-sm">
      {/* Intro */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <h4 className="font-semibold text-slate-100 flex items-center gap-2 text-base mb-1">
          <Sigma className="w-4 h-4 text-purple-400" />
          {headline}
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">{summary}</p>
      </div>

      {/* Formulas List */}
      <div className="space-y-4">
        {formulas.map((form, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl bg-[#070b12] border border-cyber-border space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-purple-400 tracking-wider">
                {form.name}
              </span>
            </div>

            {/* Formula display box */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 text-center font-mono text-cyan-300 text-base overflow-x-auto shadow-inner py-4">
              <code>{form.latex}</code>
            </div>

            <p className="text-xs text-slate-400 italic">{form.meaning}</p>

            {/* Variable definitions */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1.5">
                Физический смысл символов:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {form.variables.map((v, i) => (
                  <div key={i} className="flex items-start gap-2 p-1.5 rounded bg-slate-900/40">
                    <code className="text-purple-300 font-bold shrink-0">{v.symbol}</code>
                    <span className="text-slate-300 text-[11px]">— {v.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Numeric Walkthrough on Real Numbers */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{numericWalkthrough.title}</span>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300">
          <strong>Входные данные: </strong> {numericWalkthrough.inputData}
        </div>

        {/* Steps */}
        <div className="space-y-1.5 pt-1">
          {numericWalkthrough.calculationSteps.map((step, i) => (
            <div key={i} className="text-xs flex items-start gap-2 text-slate-300 font-mono">
              <span className="text-emerald-400 font-bold">▶</span>
              <span>{step}</span>
            </div>
          ))}
        </div>

        {/* Result & Insight */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <div className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/10 p-2.5 rounded border border-emerald-500/30">
            {numericWalkthrough.result}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-300">Практический вывод: </strong>
            {numericWalkthrough.engineeringInsight}
          </p>
        </div>
      </div>
    </div>
  );
};
