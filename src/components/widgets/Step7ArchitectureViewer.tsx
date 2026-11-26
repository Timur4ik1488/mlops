import React, { useState } from 'react';
import { sound } from '../../utils/sound';
import { Network, Sparkles, Layers, ArrowRight, ShieldCheck, Tag } from 'lucide-react';

interface BlockDetail {
  id: string;
  name: string;
  stream: 'stream1' | 'stream2' | 'fusion' | 'head';
  inputShape: string;
  outputShape: string;
  paramsCount: string;
  description: string;
  mathFormula: string;
}

const BLOCKS: Record<string, BlockDetail> = {
  embedding: {
    id: 'embedding',
    name: 'Code Token Embedding',
    stream: 'stream1',
    inputShape: '[Batch, Seq_Len] (int64)',
    outputShape: '[Batch, Seq_Len, 128]',
    paramsCount: '8192 × 128 = 1 048 576',
    description: 'Отображает целочисленные идентификаторы токенов BPE словаря в 128-мерное смысловое векторное пространство. Заполнитель <PAD> зафиксирован нулями.',
    mathFormula: 'E ∈ ℝ⁸¹⁹²ˣ¹²⁸, e_t = E[token_id_t]'
  },
  bilstm: {
    id: 'bilstm',
    name: 'Bidirectional LSTM',
    stream: 'stream1',
    inputShape: '[Batch, Seq_Len, 128]',
    outputShape: '[Batch, Seq_Len, 256]',
    paramsCount: '2 × 4 × (128×128 + 128×128 + 128) ≈ 263 168',
    description: 'Двунаправленное считывание цепочки вызовов: прямой проход от источника к стоку, обратный проход от опасного вызова к санитизации.',
    mathFormula: 'h_t = [h_forward_t ; h_backward_t] ∈ ℝ²⁵⁶'
  },
  attention: {
    id: 'attention',
    name: 'Self-Attention Pooling',
    stream: 'stream1',
    inputShape: '[Batch, Seq_Len, 256]',
    outputShape: '[Batch, 256]',
    paramsCount: '256 × 64 + 64 × 1 = 16 448',
    description: 'Адаптивное сжатие последовательности токенов в один вектор метода. Опасные ключевые слова получают 90% веса, <PAD> маскируется в ноль.',
    mathFormula: 'c = ∑ α_t · h_t ∈ ℝ²⁵⁶, α_t = Softmax(v_a^T tanh(W_a h_t))'
  },
  metadata_mlp: {
    id: 'metadata_mlp',
    name: 'Metadata Stream MLP',
    stream: 'stream2',
    inputShape: '[Batch, 12] (float32)',
    outputShape: '[Batch, 32]',
    paramsCount: '(12×64 + 64) + (64×32 + 32) + norms ≈ 3 040',
    description: 'Анализ 12 физических свойств файла и строк: энтропия Шеннона, AST-глубина, флаги аннотаций @PreAuthorize и роль файла.',
    mathFormula: 'm_out = GELU(LayerNorm(W₂ · GELU(LayerNorm(W₁ m + b₁)) + b₂))'
  },
  late_fusion: {
    id: 'late_fusion',
    name: 'Late Fusion Layer',
    stream: 'fusion',
    inputShape: '[Batch, 256 + 32] = [Batch, 288]',
    outputShape: '[Batch, 128]',
    paramsCount: '288 × 128 + 128 + 256 (LayerNorm) ≈ 37 248',
    description: 'Поздняя конкатенация экспертного синтаксического вектора кода (256D) и вектора свойств метаданных (32D) с проекцией в 128D.',
    mathFormula: 'z = Dropout(GELU(LayerNorm(W_fuse [c ; m_out] + b_fuse)))'
  },
  head_binary: {
    id: 'head_binary',
    name: 'Binary Filter Head',
    stream: 'head',
    inputShape: '[Batch, 128]',
    outputShape: '[Batch, 1] (Probability 0..1)',
    paramsCount: '128 × 1 + 1 = 129',
    description: 'Главный фильтр False Positives. Выдает вероятность наличия реальной боевой уязвимости.',
    mathFormula: 'P(Vuln) = σ(W_bin · z + b_bin) ∈ [0.0, 1.0]'
  },
  head_cwe: {
    id: 'head_cwe',
    name: 'CWE Categorizer Head',
    stream: 'head',
    inputShape: '[Batch, 128]',
    outputShape: '[Batch, 6] (Logits)',
    paramsCount: '128 × 6 + 6 = 774',
    description: 'Мультиклассовый классификатор атак: CWE-89 (SQLi), CWE-798 (Secrets), CWE-639 (IDOR), CWE-295 (TLS), CWE-306 (Auth), Clean.',
    mathFormula: 'y_cwe = Softmax(W_cwe · z + b_cwe) ∈ ℝ⁶'
  }
};

export const Step7ArchitectureViewer: React.FC = () => {
  const [selectedBlockId, setSelectedBlockId] = useState<string>('late_fusion');

  const selected = BLOCKS[selectedBlockId] || BLOCKS['late_fusion'];

  const handleSelect = (id: string) => {
    sound.playClick();
    setSelectedBlockId(id);
  };

  return (
    <div className="space-y-6 text-sm">
      <div className="bg-cyber-card/80 border border-cyber-border rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="font-semibold text-slate-100 flex items-center gap-2 text-base">
              <Network className="w-4 h-4 text-purple-400" />
              Интерактивная карта архитектуры DualBranchAppSecNet
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Кликни на любой вычислительный блок нейросети, чтобы увидеть размерности входящих и выходящих тензоров, количество весов и формулу.
            </p>
          </div>
        </div>

        {/* Visual Architecture Diagram */}
        <div className="p-5 rounded-xl bg-[#060a12] border border-slate-800 relative overflow-x-auto">
          <div className="min-w-[650px] space-y-6">
            {/* Stream 1 & Stream 2 Inputs */}
            <div className="grid grid-cols-2 gap-8">
              {/* Stream 1 Header */}
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Поток 1: Синтаксис и Поток команд (Код)
              </div>
              {/* Stream 2 Header */}
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Поток 2: Метаданные и Энтропия
              </div>
            </div>

            {/* Blocks Row 1: Encoders */}
            <div className="grid grid-cols-2 gap-8">
              {/* Stream 1 Pipeline */}
              <div className="space-y-3">
                <button
                  onClick={() => handleSelect('embedding')}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    selectedBlockId === 'embedding'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 cyber-glow-cyan'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between text-xs font-bold">
                    <span>1. nn.Embedding (BPE 8192)</span>
                    <span className="font-mono text-[11px] text-cyan-400">[B, T, 128]</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Превращение токенов в плотные векторы</div>
                </button>

                <div className="flex justify-center text-slate-600">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>

                <button
                  onClick={() => handleSelect('bilstm')}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    selectedBlockId === 'bilstm'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 cyber-glow-cyan'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between text-xs font-bold">
                    <span>2. Bi-LSTM (2 встречных прохода)</span>
                    <span className="font-mono text-[11px] text-cyan-400">[B, T, 256]</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Связывание цепочек Source -&gt; Sink</div>
                </button>

                <div className="flex justify-center text-slate-600">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>

                <button
                  onClick={() => handleSelect('attention')}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    selectedBlockId === 'attention'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 cyber-glow-cyan'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between text-xs font-bold">
                    <span>3. Self-Attention Pooling</span>
                    <span className="font-mono text-[11px] text-cyan-400">[B, 256]</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Вектор метода c фокусом на уязвимости</div>
                </button>
              </div>

              {/* Stream 2 Pipeline */}
              <div className="space-y-3">
                <button
                  onClick={() => handleSelect('metadata_mlp')}
                  className={`w-full p-4 rounded-lg border text-left transition-all h-[130px] flex flex-col justify-between ${
                    selectedBlockId === 'metadata_mlp'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 cyber-glow-emerald'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex justify-between text-xs font-bold">
                      <span>MetadataStreamMLP</span>
                      <span className="font-mono text-[11px] text-emerald-400">[B, 32]</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      12 фичей: Энтропия Шеннона, AST глубина, @PreAuthorize, роль файла
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-emerald-300/80">
                    Linear(12, 64) -&gt; GELU -&gt; Linear(64, 32)
                  </div>
                </button>

                <div className="p-3 rounded-lg bg-slate-950/60 border border-dashed border-slate-800 text-[11px] text-slate-500">
                  ⚡ Вычисляется параллельно за 0.1 мс на CPU без задержки
                </div>
              </div>
            </div>

            {/* Fusion Convergence Hub */}
            <div className="pt-2">
              <button
                onClick={() => handleSelect('late_fusion')}
                className={`w-full p-4 rounded-xl border text-center transition-all ${
                  selectedBlockId === 'late_fusion'
                    ? 'bg-purple-500/20 border-purple-400 text-purple-200 cyber-glow-purple'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-center gap-3 text-sm font-bold">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>БЛОК СЛИЯНИЯ: Late Fusion (torch.cat([code, meta], dim=-1))</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    256D + 32D = 288D ➔ 128D
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Объединение мнений синтаксического и физического экспертов в скрытый вектор решения z ∈ ℝ¹²⁸
                </div>
              </button>
            </div>

            {/* Multi-Task Heads */}
            <div className="grid grid-cols-2 gap-8 pt-2">
              {/* Head 1 */}
              <button
                onClick={() => handleSelect('head_binary')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedBlockId === 'head_binary'
                    ? 'bg-rose-500/20 border-rose-400 text-rose-200'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                    Голова 1: Бинарный фильтр
                  </span>
                  <span className="font-mono text-xs text-rose-300">[B, 1]</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Вероятность P(Vuln) для CI/CD блокировки
                </div>
              </button>

              {/* Head 2 */}
              <button
                onClick={() => handleSelect('head_cwe')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedBlockId === 'head_cwe'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                    Голова 2: CWE Классификатор
                  </span>
                  <span className="font-mono text-xs text-amber-300">[B, 6]</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  6 классов атак (SQLi, Secret, IDOR, TLS...)
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Selected Layer Details Card */}
        <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">
                Детальный паспорт слоя
              </span>
              <h5 className="text-base font-bold text-slate-100 font-mono">
                {selected.name}
              </h5>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300">
                Вход: <strong className="text-cyan-300">{selected.inputShape}</strong>
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300">
                Выход: <strong className="text-emerald-300">{selected.outputShape}</strong>
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {selected.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-xs font-mono">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-slate-500 block text-[10px] uppercase">Параметры слоя:</span>
              <span className="text-purple-300 font-bold">{selected.paramsCount}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-slate-500 block text-[10px] uppercase">Математическая формула:</span>
              <span className="text-cyan-300 font-bold">{selected.mathFormula}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
