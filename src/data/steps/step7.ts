import { RoadmapStep } from '../../types';

export const step7: RoadmapStep = {
  id: 7,
  title: 'Слияние потоков (Late Fusion) и Мультизадачность',
  subtitle: 'Объединение 256 + 32 = 288 признаков и параллельные головы: бинарная + CWE',
  duration: '30 мин',
  iconName: 'Network',
  category: 'fusion',
  overview: {
    problemTitle: 'Необходимость одновременного ответа на два вопроса: Есть ли уязвимость? И какая именно?',
    problemDescription:
      'Если обучать отдельную нейросеть только на бинарный ответ (0 = Safe, 1 = Vulnerable), модель выучит грубые поверхностные корреляции. Она не будет понимать внутреннюю физическую разницу между SQL Injection (манипуляция с синтаксисом запроса к БД) и Hardcoded Secret (криптографическая энтропия ключа). В то же время, если обучать только многоклассовую классификацию CWE, модель начнет путаться в тонких ложных срабатываниях на чистом коде.',
    solutionTitle: 'Мультизадачное обучение (Multi-Task Learning) и Позднее слияние (Late Fusion)',
    solutionDescription:
      'Мы объединяем вектор синтаксиса кода (256 чисел из Bi-LSTM Attention) и вектор метаданных (32 числа из Metadata MLP) в один расширенный вектор z_fused размерности 288. После прохождения через слой нормализации и сжатия до 128 признаков, сеть разветвляется на две специализированные головы:\n1. Бинарная голова (Binary Head): выдает вероятность P(Vuln) ∈ [0, 1] через сигмоиду.\n2. Классификатор CWE (Multi-Class Head): выдает логиты 6 категорий через Softmax (CWE-89 SQLi, CWE-798 Hardcoded Secrets, CWE-639 IDOR, CWE-295 TLS Bypass, CWE-306 Missing Auth, CWE-0 Clean).',
    deepExplanation: [
      'Late Fusion vs Early Fusion: При Early Fusion мы бы смешали метаданные с эмбеддингами токенов в самом начале. Но токены — это упорядоченная последовательность, а метаданные — это свойства целого файла. Позднее слияние (Late Fusion) позволяет каждому специализированному потоку сначала выжать максимум из своего типа данных, и лишь затем объединить экспертные заключения.',
      'Регуляризация через мультизадачность: классификация конкретного CWE заставляет общие скрытые слои выучивать детальную природу уязвимостей, что резко повышает точность бинарного фильтра ложных тревог.',
      'Комбинированный Loss: общая функция потерь является взвешенной суммой бинарной ошибки и ошибки многоклассовой кросс-энтропии: L_total = L_binary + 0.5 * L_cwe.'
    ],
    realWorldPitfalls: [
      'Конфликт градиентов голов: если одна голова обучается слишком быстро, ее градиенты могут разрушить признаки другой. Для этого веса потерь калибруются коэффициентом 0.5.',
      'Несогласованность выходов: если бинарная голова говорит "Безопасно" (P = 0.05), а классификатор CWE выдает высокий скор для CWE-89, в пайплайне uncflow приоритет всегда отдается бинарной голове.'
    ],
    productionTip: 'При деплое обе головы вычисляются за один единственный прямой проход (forward pass), не требуя повторного запуска тяжелого LSTM энкодера.'
  },
  mathematics: {
    headline: 'Математика Слияния Векторов и Двух Выходных Голов',
    summary:
      'Векторная конкатенация, проекция с регуляризацией и формулы вероятностей для двух голов.',
    formulas: [
      {
        name: 'Late Fusion (Векторная конкатенация)',
        latex: 'z_{\\text{fused}} = [c \\,;\\, m_{\\text{out}}] \\in \\mathbb{R}^{256 + 32} = \\mathbb{R}^{288}',
        meaning: 'Склейка контекстного вектора кода c и вектора метаданных m_out',
        variables: [
          { symbol: 'c ∈ ℝ²⁵⁶', desc: 'Вектор из Self-Attention Pooling (Поток 1)' },
          { symbol: 'm_out ∈ ℝ³²', desc: 'Вектор из MetadataStreamMLP (Поток 2)' }
        ]
      },
      {
        name: 'Скрытое представление слияния',
        latex: 'z = \\text{Dropout}(\\text{GELU}(\\text{LayerNorm}(W_{\\text{fuse}} z_{\\text{fused}} + b_{\\text{fuse}})), p=0.3) \\in \\mathbb{R}^{128}',
        meaning: 'Проекция объединенного вектора в компактное 128-мерное пространство решений',
        variables: [
          { symbol: 'W_fuse ∈ ℝ¹²⁸ˣ²⁸⁸', desc: 'Матрица проекции блока слияния' }
        ]
      },
      {
        name: 'Бинарная и Многоклассовая головы',
        latex: '\\hat{y}_{\\text{vuln}} = \\sigma(W_{\\text{bin}} z + b_{\\text{bin}}), \\quad \\hat{y}_{\\text{cwe}} = \\text{Softmax}(W_{\\text{cwe}} z + b_{\\text{cwe}}) \\in \\mathbb{R}^6',
        meaning: 'Параллельное вычисление вероятности атаки и распределения по 6 классам CWE',
        variables: [
          { symbol: 'ŷ_vuln ∈ [0, 1]', desc: 'Вероятность наличия уязвимости' },
          { symbol: 'ŷ_cwe ∈ ℝ⁶', desc: 'Вероятности 6 классов CWE (сумма = 1.0)' }
        ]
      }
    ],
    numericWalkthrough: {
      title: 'Расчет выходов двух голов для сниппета с инъекцией',
      inputData: 'Скрытый вектор z после слияния. Выход линейного слоя бинарной головы raw_bin = 2.5. Логиты 3 классов CWE: [SQLi: 4.0, Hardcoded: 1.0, Clean: -1.0]',
      calculationSteps: [
        'Шаг 1: Бинарная голова: σ(2.5) = 1 / (1 + e^(-2.5)) = 1 / (1 + 0.082) ≈ 0.924 (92.4% уязвимость)',
        'Шаг 2: Экспоненты логитов CWE: exp(4.0) ≈ 54.6, exp(1.0) ≈ 2.718, exp(-1.0) ≈ 0.368',
        'Шаг 3: Сумма экспонент: 54.6 + 2.718 + 0.368 = 57.686',
        'Шаг 4: Вероятность CWE-89 (SQLi): 54.6 / 57.686 ≈ 0.946 (94.6%)',
        'Шаг 5: Вероятность Hardcoded Secret: 2.718 / 57.686 ≈ 0.047 (4.7%)'
      ],
      result: 'Сеть однозначно классифицировала метод как боевую уязвимость с типом CWE-89 SQL Injection.',
      engineeringInsight: 'Обе головы согласованы: высокий бинарный скор (92.4%) подкреплен доминированием SQLi (94.6%).'
    }
  },
  code: {
    language: 'python',
    filename: 'dual_branch_appsec_net.py',
    description: 'Полная законченная архитектура двухпоточной нейросети DualBranchAppSecNet на PyTorch.',
    snippet: `import torch
import torch.nn as nn

class DualBranchAppSecNet(nn.Module):
    """
    Полная двухпоточная нейросеть для анализа безопасности кода:
    Поток 1: Embedding -> Bi-LSTM -> Attention Pooling (256D)
    Поток 2: Metadata 12D -> Dense LayerNorm GELU (32D)
    Late Fusion: 288D -> Dense 128D -> [Binary Head, CWE Head (6 classes)]
    """
    def __init__(self, vocab_size=8192, emb_dim=128, lstm_dim=128, meta_dim=12, num_classes=6):
        super().__init__()
        # Поток 1: Код
        self.embedding = nn.Embedding(vocab_size, emb_dim, padding_idx=0)
        self.lstm = nn.LSTM(emb_dim, lstm_dim, batch_first=True, bidirectional=True)
        self.att_proj = nn.Linear(lstm_dim * 2, 64)
        self.att_v = nn.Linear(64, 1, bias=False)
        
        # Поток 2: Метаданные
        self.meta_stream = nn.Sequential(
            nn.Linear(meta_dim, 32),
            nn.LayerNorm(32),
            nn.GELU()
        )
        
        # Блок слияния (Late Fusion)
        self.fuse = nn.Sequential(
            nn.Linear((lstm_dim * 2) + 32, 128),
            nn.LayerNorm(128),
            nn.GELU(),
            nn.Dropout(p=0.3)
        )
        
        # Выходные головы
        self.head_vuln = nn.Linear(128, 1)          # Бинарная
        self.head_cwe = nn.Linear(128, num_classes)  # 6 классов CWE

    def forward(self, token_ids, mask, metadata):
        # 1. Поток кода
        x = self.embedding(token_ids)
        h, _ = self.lstm(x)
        scores = self.att_v(torch.tanh(self.att_proj(h))).squeeze(-1)
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        weights = torch.softmax(scores, dim=-1).unsqueeze(-1)
        code_vec = torch.sum(h * weights, dim=1) # [Batch, 256]

        # 2. Поток метаданных
        meta_vec = self.meta_stream(metadata)   # [Batch, 32]

        # 3. Слияние (Late Fusion)
        fused = torch.cat([code_vec, meta_vec], dim=-1) # [Batch, 288]
        z = self.fuse(fused) # [Batch, 128]

        # 4. Выходы голов
        prob_vuln = torch.sigmoid(self.head_vuln(z))
        logits_cwe = self.head_cwe(z)
        return prob_vuln, logits_cwe

# Тестовая проверка работоспособности:
model = DualBranchAppSecNet()
dummy_tokens = torch.randint(1, 1000, (2, 64))
dummy_mask = torch.ones(2, 64)
dummy_meta = torch.randn(2, 12)

prob, cwe_logits = model(dummy_tokens, dummy_mask, dummy_meta)
print("Вероятность уязвимости:", prob.shape)       # [2, 1]
print("Логиты 6 категорий CWE:", cwe_logits.shape) # [2, 6]
`,
    lineExplanations: [
      { lines: '13-23', comment: 'Инициализация слоев обоих потоков и размерностей 256 и 32' },
      { lines: '26-36', comment: 'Слой слияния 288 -> 128 и две параллельные линейные головы' },
      { lines: '49-56', comment: 'Конкатенация тензоров torch.cat вдоль последней размерности' }
    ],
    architectureNote: 'Именно эта законченная архитектура компилируется на Шаге 9 в формат ONNX для продакшена.'
  },
  quiz: {
    questions: [
      {
        id: 'q7-1',
        question: 'Почему склейка векторов кода и метаданных происходит в конце (Late Fusion), а не в начале (Early Fusion)?',
        options: [
          'Потому что в начале модели не хватает видеопамяти для конкатенации',
          'Потому что токены представляют временную последовательность шагов, а метаданные — статичные свойства всего сниппета; каждому потоку нужна своя специализированная архитектура',
          'Late Fusion запрещен стандартами OWASP',
          'При Early Fusion невозможно обучить бинарную голову'
        ],
        correctAnswer: 1,
        explanation: 'Нельзя просто приклеить скалярные метаданные к последовательности слов, так как они имеют разную математическую природу. Bi-LSTM оптимизирована под текст, а MLP — под числовые векторы. Слияние на уровне высокоуровневых эмбеддингов дает максимальное качество.'
      },
      {
        id: 'q7-2',
        question: 'Какую выгоду дает обучение дополнительной головы классификации CWE для главной задачи фильтрации False Positives?',
        options: [
          'Увеличивает скорость инференса модели на 50%',
          'Выступает мощным регуляризатором: сеть вынуждена выучивать физическую специфику конкретных атак, что повышает точность разделения "шум/атака"',
          'Позволяет запускать модель без PyTorch',
          'Автоматически генерирует pull request с исправлением бага'
        ],
        correctAnswer: 1,
        explanation: 'Multi-Task Learning заставляет скрытые представления кодировать глубокие семантические различия между классами атак, не позволяя модели переобучиться под поверхностный шум.'
      }
    ],
    task: {
      title: 'Расчет размерности тензора после конкатенации',
      description: 'Поток 1 выдает контекстный вектор кода размерности B x 256. Поток 2 выдает вектор метаданных размерности B x 32. Какой будет размерность тензора после вызова `torch.cat([code, meta], dim=-1)`? Сколько параметров будет содержать первый линейный слой Fusion блока `nn.Linear(in_features, 128)`?',
      hints: [
        'dim=-1 означает конкатенацию вдоль последнего измерения',
        'Количество параметров линейного слоя: in_features * out_features + out_features (веса + bias)'
      ],
      solution: '1. Размерность тензора: [B, 256 + 32] = [B, 288].\n2. Количество весов: 288 * 128 = 36 864.\n3. Смещение (bias): 128.\nИтого параметров слоя: 36 864 + 128 = 36 992 параметра.',
      explanation: 'Благодаря сжатию в 128 нейронов, слой слияния остается крайне легковесным и занимает менее 150 КБ оперативной памяти.'
    }
  }
};
