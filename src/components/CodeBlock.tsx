import React, { useState } from 'react';
import { sound } from '../utils/sound';
import { Copy, Check, Terminal, FileCode2 } from 'lucide-react';

interface CodeBlockProps {
  language: 'python' | 'typescript';
  filename: string;
  snippet: string;
  lineExplanations: { lines: string; comment: string }[];
  architectureNote?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  language,
  filename,
  snippet,
  lineExplanations,
  architectureNote,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async () => {
    sound.playClick();
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const lines = snippet.trim().split('\n');

  return (
    <div className="space-y-4">
      {/* Code Container */}
      <div className="rounded-xl border border-cyber-border overflow-hidden bg-[#070b12] shadow-xl">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-cyber-border">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <FileCode2 className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-100">{filename}</span>
            <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              {language}
            </span>
          </div>

          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Скопировано!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Копировать код</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 overflow-x-auto text-xs font-mono leading-relaxed">
          <pre className="text-slate-200">
            {lines.map((line, idx) => (
              <div key={idx} className="table-row hover:bg-slate-800/30 transition-colors">
                <span className="table-cell pr-4 text-slate-600 select-none text-right font-mono text-[11px]">
                  {idx + 1}
                </span>
                <span className="table-cell whitespace-pre">
                  {line.startsWith('#') || line.startsWith('//') ? (
                    <span className="text-slate-500 italic">{line}</span>
                  ) : line.includes('class ') || line.includes('def ') || line.includes('export ') ? (
                    <span className="text-purple-400 font-semibold">{line}</span>
                  ) : line.includes('import ') || line.includes('from ') ? (
                    <span className="text-cyan-400">{line}</span>
                  ) : line.includes('return ') ? (
                    <span className="text-rose-400 font-semibold">{line}</span>
                  ) : (
                    line
                  )}
                </span>
              </div>
            ))}
          </pre>
        </div>
      </div>

      {/* Line explanations */}
      {lineExplanations.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" />
            Разбор ключевых участков кода:
          </h5>
          <div className="space-y-1.5">
            {lineExplanations.map((exp, i) => (
              <div key={i} className="text-xs flex items-start gap-2.5">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px] shrink-0">
                  Строки {exp.lines}
                </span>
                <span className="text-slate-300 leading-relaxed">{exp.comment}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Architecture note */}
      {architectureNote && (
        <div className="p-3.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 flex items-start gap-2.5">
          <span className="text-purple-400 font-bold shrink-0">💡 Инженерная заметка:</span>
          <span className="leading-relaxed">{architectureNote}</span>
        </div>
      )}
    </div>
  );
};
