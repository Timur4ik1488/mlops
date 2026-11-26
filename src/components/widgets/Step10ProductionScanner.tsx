import React, { useState } from 'react';
import { sound } from '../../utils/sound';
import { Server, Play, ShieldAlert, ShieldCheck, AlertTriangle, Clock, Zap, CheckCircle2 } from 'lucide-react';

interface TestCase {
  id: string;
  title: string;
  codeSnippet: string;
  fileContext: string;
  expectedProb: number;
  expectedVerdict: 'BLOCKED' | 'SUSPICIOUS' | 'CLEAN';
  action: 'FAIL_CI' | 'ESCALATE_TO_LLM' | 'SUPPRESS_ALERT';
  cwe: string;
  description: string;
}

const TEST_CASES: TestCase[] = [
  {
    id: 'case1',
    title: '1. Боевая SQL-инъекция через конкатенацию строки',
    codeSnippet: 'jdbcTemplate.query("SELECT * FROM users WHERE id = \'" + userInput + "\'")',
    fileContext: 'src/main/kotlin/com/uncflow/controller/UserController.kt',
    expectedProb: 0.962,
    expectedVerdict: 'BLOCKED',
    action: 'FAIL_CI',
    cwe: 'CWE-89: SQL Injection',
    description: 'Прямая конкатенация непроверенного параметра пользователя в SQL Sink. Контроллер без правки.'
  },
  {
    id: 'case2',
    title: '2. Безопасный запрос с параметризацией (False Positive SAST)',
    codeSnippet: 'jdbcTemplate.query("SELECT * FROM users WHERE id = ?", userInput)',
    fileContext: 'src/main/kotlin/com/uncflow/service/UserService.kt',
    expectedProb: 0.041,
    expectedVerdict: 'CLEAN',
    action: 'SUPPRESS_ALERT',
    cwe: 'CWE-0: Clean',
    description: 'Используется JDBC плейсхолдер \'?\'. Регулярка SAST кричала о SELECT, но нейросеть верно отсеяла шум.'
  },
  {
    id: 'case3',
    title: '3. Захардкоженный токен в юнит-тесте (False Positive SAST)',
    codeSnippet: 'val testToken = "AKIAIOSFODNN7EXAMPLE_MOCK_TEST_SECRET"',
    fileContext: 'src/test/kotlin/com/uncflow/mocks/SecurityMockTest.kt',
    expectedProb: 0.082,
    expectedVerdict: 'CLEAN',
    action: 'SUPPRESS_ALERT',
    cwe: 'CWE-0: Clean',
    description: 'Строка имеет высокую энтропию, но Поток 2 распознал путь src/test/ и роль Mock, подавив тревогу.'
  },
  {
    id: 'case4',
    title: '4. Подозрительная динамическая конкатенация путей',
    codeSnippet: 'val targetFile = File(baseUploadDir, userProvidedPath)',
    fileContext: 'src/main/kotlin/com/uncflow/util/FileStorage.kt',
    expectedProb: 0.648,
    expectedVerdict: 'SUSPICIOUS',
    action: 'ESCALATE_TO_LLM',
    cwe: 'CWE-22: Path Traversal',
    description: 'Пограничный случай: возможно Path Traversal (../../etc/passwd). Автоматически эскалируется в GigaChat-Pro.'
  }
];

export const Step10ProductionScanner: React.FC = () => {
  const [activeCaseId, setActiveCaseId] = useState<string>('case1');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<TestCase | null>(TEST_CASES[0]);
  const [latency, setLatency] = useState<number>(3.4);

  const runScan = (testCase: TestCase) => {
    sound.playClick();
    setIsScanning(true);
    setActiveCaseId(testCase.id);

    // Simulate 3-5 ms ONNX Runtime inference in background
    setTimeout(() => {
      const simulatedLatency = Math.round((2.8 + Math.random() * 1.8) * 10) / 10;
      setLatency(simulatedLatency);
      setScanResult(testCase);
      setIsScanning(false);

      if (testCase.expectedVerdict === 'BLOCKED') {
        sound.playError();
      } else if (testCase.expectedVerdict === 'CLEAN') {
        sound.playSuccess();
      } else {
        sound.playClick();
      }
    }, 450);
  };

  return (
    <div className="space-y-6 text-sm">
      <div className="bg-cyber-card/80 border border-cyber-border rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="font-semibold text-slate-100 flex items-center gap-2 text-base">
              <Server className="w-4 h-4 text-emerald-400" />
              Консоль боевого тестирования сканера uncflow в реальном времени
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Запусти инференс скомпилированной ONNX модели на реальных сниппетах кода и оцени скорость отклика и работу трехуровневой маршрутизации.
            </p>
          </div>
        </div>

        {/* Test Case Picker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {TEST_CASES.map((tc) => (
            <button
              key={tc.id}
              onClick={() => runScan(tc)}
              disabled={isScanning}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                activeCaseId === tc.id
                  ? 'bg-slate-900 border-cyan-400/60 shadow-lg'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-slate-200 mb-1 flex items-center justify-between">
                  <span>{tc.title}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    tc.expectedVerdict === 'BLOCKED'
                      ? 'bg-rose-500/20 text-rose-300'
                      : tc.expectedVerdict === 'CLEAN'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {tc.cwe.split(':')[0]}
                  </span>
                </div>
                <code className="text-[11px] font-mono text-cyan-300/80 line-clamp-1">
                  {tc.codeSnippet}
                </code>
              </div>
              <div className="text-[10px] text-slate-500 mt-2 truncate">
                Файл: {tc.fileContext}
              </div>
            </button>
          ))}
        </div>

        {/* Scanner Execution Console */}
        {scanResult && (
          <div className="p-5 rounded-xl bg-[#060a12] border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-xs text-slate-300 font-semibold">
                  ONNX Engine v1.16 [AVX-512 VNNI]
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  Задержка: <strong className="text-cyan-300">{latency} мс</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-purple-400" />
                  Модель: 14.8 МБ INT8
                </span>
              </div>
            </div>

            {/* Code Snippet Under Scan */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs">
              <div className="text-slate-500 text-[10px] mb-1">
                Контекст файла: <span className="text-slate-400">{scanResult.fileContext}</span>
              </div>
              <div className="text-cyan-200 font-medium">
                {scanResult.codeSnippet}
              </div>
            </div>

            {/* Verdict Output Banner */}
            <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${
              scanResult.expectedVerdict === 'BLOCKED'
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                : scanResult.expectedVerdict === 'CLEAN'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/40 text-amber-300'
            }`}>
              <div className="flex items-center gap-4">
                {scanResult.expectedVerdict === 'BLOCKED' ? (
                  <ShieldAlert className="w-10 h-10 text-rose-400 shrink-0 animate-pulse" />
                ) : scanResult.expectedVerdict === 'CLEAN' ? (
                  <ShieldCheck className="w-10 h-10 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-10 h-10 text-amber-400 shrink-0" />
                )}
                <div>
                  <div className="text-xs uppercase font-bold tracking-wider opacity-75">
                    Вердикт трехуровневого конвейера uncflow:
                  </div>
                  <div className="text-xl font-bold font-mono mt-0.5">
                    {scanResult.expectedVerdict === 'BLOCKED'
                      ? '🚨 BLOCKED — БЛОКИРОВКА СБОРКИ CI/CD'
                      : scanResult.expectedVerdict === 'CLEAN'
                      ? '🟢 CLEAN / FALSE POSITIVE — ЧИСТЫЙ КОД'
                      : '⚠️ SUSPICIOUS — ЭСКАЛАЦИЯ В LLM (GigaChat)'}
                  </div>
                  <p className="text-xs opacity-80 mt-1 max-w-xl">
                    {scanResult.description}
                  </p>
                </div>
              </div>

              {/* Confidence Badge */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center shrink-0 min-w-[130px]">
                <div className="text-[10px] uppercase text-slate-400 font-semibold">Уверенность:</div>
                <div className="text-2xl font-bold font-mono text-slate-100">
                  {(scanResult.expectedProb * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                  Действие: {scanResult.action}
                </div>
              </div>
            </div>

            {/* Pipeline Routing Explanation */}
            <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-300">Архитектурная логика: </strong>
              {scanResult.expectedVerdict === 'BLOCKED' &&
                'Уверенность 96.2% ≥ 0.85. Коммит автоматически отклонен, в терминал разработчика выдан стек-трейс и рекомендации по фиксу.'}
              {scanResult.expectedVerdict === 'CLEAN' &&
                'Уверенность уязвимости всего 4.1% < 0.40. Шум регулярных сканеров отфильтрован за 3 мс. Сборка продолжается без задержек.'}
              {scanResult.expectedVerdict === 'SUSPICIOUS' &&
                'Уверенность 64.8% попала в диапазон [0.40, 0.85). Сниппет направлен в GigaChat-Pro. Разработчик получит экспертную справку.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
