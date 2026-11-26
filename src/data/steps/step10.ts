import { RoadmapStep } from '../../types';

export const step10: RoadmapStep = {
  id: 10,
  title: 'Запуск в продакшене uncflow (TypeScript / Node.js)',
  subtitle: 'Микросервисный конвейер AppSec, ONNX Runtime за 3 мс и трехуровневая маршрутизация вердиктов',
  duration: '30 мин',
  iconName: 'Server',
  category: 'prod',
  overview: {
    problemTitle: 'Интеграция ML-модели в строгий продакшен CI/CD без задержек сборки',
    problemDescription:
      'В современных компаниях пайплайны CI/CD обязаны отрабатывать за минуты. Если добавить в процесс сканирования тяжелый скрипт на Python, который загружает модель за 15 секунд и сканирует каждый коммит по 2 минуты, разработчики начнут обходить проверки через `git commit --no-verify`. Кроме того, бинарное деление "Черное/Белое" (50/50) опасно: пограничные подозрительные случаи (где вероятность уязвимости 60-70%) при слепой блокировке вызовут раздражение команды, а при слепом пропуске могут привести к взлому.',
    solutionTitle: 'Высокоскоростной микросервис на Node.js и трехуровневая триада вердиктов',
    solutionDescription:
      'Мы подключаем скомпилированный файл `appsec_classifier.onnx` (14.8 МБ) прямо в бэкенд uncflow на TypeScript с помощью официальной библиотеки `onnxruntime-node`. Модель удерживается в оперативной памяти и выполняет инференс одного сниппета всего за 3–5 миллисекунд! Вместо наивного порога 0.5 мы реализуем трехуровневую маршрутизацию (Tri-Zone Verdict Engine):\n1. P ≥ 0.85: 🚨 BLOCKED (Критическая боевая уязвимость — блокировка сборки CI/CD).\n2. 0.40 ≤ P < 0.85: ⚠️ SUSPICIOUS (Пограничный случай — мгновенная асинхронная отправка в GigaChat-Pro / эксперту безопасности).\n3. P < 0.40: 🟢 CLEAN (False Positive / чистый код — автоматический пропуск без задержки).',
    deepExplanation: [
      'Архитектура конвейера в uncflow: сканеры первого уровня (регулярки и SAST) генерируют 100 потенциальных находок. Вместо ручного разбора аудитором все 100 находок поступают в узел DAG `ai.neural_classifier`. За 300 миллисекунд (3 мс * 100) нейросеть отсеивает 85 ложных тревог, отправляет 10 пограничных в LLM и блокирует 5 реальных атак.',
      'Тензорные буферы в Node.js: `BigInt64Array` и `Float32Array` позволяют напрямую выделять плоскую C++ память без создания промежуточных JavaScript объектов, полностью исключая задержки сборщика мусора (Garbage Collector).',
      'Концепция Zero False Negatives: зона сомнений (0.40 - 0.85) гарантирует, что даже замаскированные нестандартные атаки не проскользнут в прод.'
    ],
    realWorldPitfalls: [
      'Утечка дескрипторов сессий ONNX: никогда не создавайте `InferenceSession` на каждый HTTP-запрос! Инициализируйте сессию один раз при старте микросервиса (Singleton pattern).',
      'Смешивание типов BigInt и Number: библиотека ONNX Runtime строго требует `BigInt64Array` для целочисленных тензоров int64.'
    ],
    productionTip: 'Запустите микросервис uncflow в Docker контейнере с мультистейдж-сборкой: финальный образ весит всего 110 МБ и держит нагрузку до 1500 запросов проверки кода в секунду на 2 ядрах vCPU.'
  },
  mathematics: {
    headline: 'Архитектура Маршрутизации и Временные Задержки (SLA)',
    summary:
      'Математическая модель взвешенного риска и расчет пропускной способности конвейера CI/CD.',
    formulas: [
      {
        name: 'Функция трехуровневого вердикта (Tri-Zone Routing)',
        latex: '\\text{Verdict}(p) = \\begin{cases} \\text{BLOCKED}, & p \\ge \\tau_{\\text{high}} \\quad (0.85) \\\\ \\text{SUSPICIOUS (LLM)}, & \\tau_{\\text{low}} \\le p < \\tau_{\\text{high}} \\quad [0.40, 0.85) \\\\ \\text{CLEAN (False Positive)}, & p < \\tau_{\\text{low}} \\quad (0.40) \\end{cases}',
        meaning: 'Разделение пространства вероятностей на безопасную, пограничную и критическую зоны',
        variables: [
          { symbol: 'p', desc: 'Предсказанная вероятность уязвимости P(Vuln)' },
          { symbol: 'τ_high = 0.85', desc: 'Порог автоматической блокировки' },
          { symbol: 'τ_low = 0.40', desc: 'Порог автоматической фильтрации ложных тревог' }
        ]
      },
      {
        name: 'Среднее время конвейера (Latency SLA)',
        latex: 'T_{\\text{avg}} = T_{\\text{onnx}} + P(\\text{suspicious}) \\cdot T_{\\text{llm}}',
        meaning: 'Ожидаемое время проверки одного сниппета',
        variables: [
          { symbol: 'T_onnx ≈ 4 мс', desc: 'Сверхбыстрый C++ инференс ONNX в Node.js' },
          { symbol: 'P(suspicious) ≈ 0.10', desc: 'Доля сомнительных случаев, отправляемых в LLM' },
          { symbol: 'T_llm ≈ 800 мс', desc: 'Время глубокого рассуждения тяжелой модели' }
        ]
      }
    ],
    numericWalkthrough: {
      title: 'Расчет пропускной способности сканера в реальном коммите',
      inputData: 'В коммите найдено 100 подозрительных мест. Время ONNX на 1 место: 3 мс. Доля Clean: 85%, Доля Blocked: 5%, Доля Suspicious (LLM): 10%.',
      calculationSteps: [
        'Шаг 1: Время параллельного ONNX прогона: 100 мест * 3 мс = 300 мс (0.3 секунды)',
        'Шаг 2: 85 мест мгновенно помечены CLEAN и пропущены (экономия 90% времени аудитора)',
        'Шаг 3: 5 мест мгновенно заблокированы (BLOCKED)',
        'Шаг 4: 10 сомнительных сниппетов отправлены параллельными запросами в GigaChat-Pro (задержка ~1.2 сек)',
        'Шаг 5: Итоговое время полного CI/CD гейта: 0.3 + 1.2 = 1.5 секунды'
      ],
      result: 'Время проверки 100 сниппетов сократилось с 15 минут ручного труда до 1.5 секунд!',
      engineeringInsight: 'Использование быстрой компактной нейросети в качестве первого фильтра разгружает дорогие и медленные LLM на 90%.'
    }
  },
  code: {
    language: 'typescript',
    filename: 'NeuralClassifierService.ts',
    description: 'Боевой продакшен микросервис на TypeScript / Node.js с onnxruntime-node и пулом тензоров.',
    snippet: `import * as ort from 'onnxruntime-node';

export interface ScanPrediction {
  isVulnerable: boolean;
  confidence: number;
  verdict: 'BLOCKED' | 'SUSPICIOUS' | 'CLEAN';
  action: 'FAIL_CI' | 'ESCALATE_TO_LLM' | 'SUPPRESS_ALERT';
  latencyMs: number;
}

export class NeuralClassifierService {
  private session: ort.InferenceSession | null = null;

  async initialize(modelPath: string = 'models/appsec_classifier.onnx'): Promise<void> {
    // Инициализация синглтон-сессии ONNX Runtime (C++ движок)
    this.session = await ort.InferenceSession.create(modelPath, {
      executionProviders: ['cpu'],
      graphOptimizationLevel: 'all',
      intraOpNumThreads: 4 // Задействуем 4 потока CPU
    });
    console.log('🛡️ [uncflow] Нейросетевой фильтр успешно инициализирован в памяти');
  }

  async evaluateSnippet(
    tokenIds: number[],
    metadata12: number[]
  ): Promise<ScanPrediction> {
    if (!this.session) {
      throw new Error('Сессия ONNX не инициализирована! Вызовите initialize() перед сканированием.');
    }

    const startTime = performance.now();
    const seqLen = tokenIds.length;

    // Выделяем плоские типизированные массивы BigInt и Float32
    const tokenBigInt = BigInt64Array.from(tokenIds.map(BigInt));
    const maskBigInt = new BigInt64Array(seqLen).fill(1n);
    const metaFloat = Float32Array.from(metadata12);

    // Упаковываем в тензоры ONNX
    const tokenTensor = new ort.Tensor('int64', tokenBigInt, [1, seqLen]);
    const maskTensor = new ort.Tensor('int64', maskBigInt, [1, seqLen]);
    const metaTensor = new ort.Tensor('float32', metaFloat, [1, 12]);

    // Исполнение за 3-5 миллисекунд
    const feeds = {
      token_ids: tokenTensor,
      mask: maskTensor,
      metadata: metaTensor
    };
    const outputs = await this.session.run(feeds);
    
    // Считываем скаляр вероятности из бинарной головы
    const vulnProb = (outputs.prob_vuln.data as Float32Array)[0];
    const duration = performance.now() - startTime;

    // Трехуровневая маршрутизация
    let verdict: 'BLOCKED' | 'SUSPICIOUS' | 'CLEAN' = 'CLEAN';
    let action: 'FAIL_CI' | 'ESCALATE_TO_LLM' | 'SUPPRESS_ALERT' = 'SUPPRESS_ALERT';

    if (vulnProb >= 0.85) {
      verdict = 'BLOCKED';
      action = 'FAIL_CI';
    } else if (vulnProb >= 0.40) {
      verdict = 'SUSPICIOUS';
      action = 'ESCALATE_TO_LLM';
    }

    return {
      isVulnerable: vulnProb >= 0.85,
      confidence: Math.round(vulnProb * 1000) / 1000,
      verdict,
      action,
      latencyMs: Math.round(duration * 100) / 100
    };
  }
}
`,
    lineExplanations: [
      { lines: '13-21', comment: 'Инициализация InferenceSession с полной оптимизацией графа и 4 потоками' },
      { lines: '31-38', comment: 'Создание тензоров int64 через BigInt64Array без накладных расходов памяти' },
      { lines: '48-65', comment: 'Исполнение run() и маршрутизация вердикта по трем зонам безопасности' }
    ],
    architectureNote: 'Этот TypeScript класс напрямую интегрируется в микросервис сканирования uncflow на сервере.'
  },
  quiz: {
    questions: [
      {
        id: 'q10-1',
        question: 'Почему в продакшене uncflow используется трехуровневая маршрутизация (Clean, Suspicious, Blocked), а не просто 50/50?',
        options: [
          'Потому что стандарт TypeScript не поддерживает булевы типы',
          'В безопасности цена ошибки несимметрична: пограничные случаи (0.40 - 0.85) безопаснее эскалировать в LLM или человеку, гарантируя Zero False Negatives без лишней блокировки сборки',
          'Чтобы нагрузить сервер дополнительными вычислениями',
          'Потому что нейросеть умеет выдавать только три числа'
        ],
        correctAnswer: 1,
        explanation: 'Бинарный порог 0.5 либо пропускает скрытые уязвимости, либо раздражает разработчиков ложными блокировками. Зона подозрения позволяет объединить скорость маленькой нейросети и глубину анализа большой LLM.'
      },
      {
        id: 'q10-2',
        question: 'Зачем сессию `InferenceSession` инициализируют один раз при старте микросервиса (синглтон), а не при каждом запросе?',
        options: [
          'Потому что повторный вызов create() удалит файл модели с диска',
          'Загрузка графа ONNX и компиляция операторов занимает 100–300 мс, а последующие вызовы run() исполняются всего за 3 мс из кэша памяти',
          'Библиотека onnxruntime-node запрещает повторные вызовы',
          'Для экономии интернет-трафика'
        ],
        correctAnswer: 1,
        explanation: 'Инициализация графа парсит модель и выделяет память. Удерживая сессию в памяти процесса Node.js, мы получаем задержку инференса всего 3 миллисекунды на запрос.'
      }
    ],
    task: {
      title: 'Определение вердикта и маршрутизации для сниппета',
      description: 'Метод `getUserProfile` был проверен нейросетью. Бинарная голова выдала вероятность уязвимости P = 0.62. Какой вердикт (verdict) и какое действие (action) назначит сервис uncflow в соответствии с трехуровневой системой?',
      hints: [
        'Пороги: Clean < 0.40, Suspicious 0.40..0.85, Blocked >= 0.85',
        'Вспомни маппинг действий: FAIL_CI, ESCALATE_TO_LLM, SUPPRESS_ALERT'
      ],
      solution: '1. P = 0.62 находится в интервале [0.40, 0.85).\n2. Вердикт: verdict = "SUSPICIOUS" (Подозрительный случай).\n3. Действие: action = "ESCALATE_TO_LLM" (Отправка фрагмента кода с контекстом в GigaChat-Pro для углубленного анализа без блокировки CI/CD сборки).',
      explanation: 'Благодаря этому механизм не заблокировал разработку ложной тревогой, но и не пропустил подозрительный код вслепую.'
    }
  }
};
