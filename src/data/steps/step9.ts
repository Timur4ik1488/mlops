import { RoadmapStep } from '../../types';

export const step9: RoadmapStep = {
  id: 9,
  title: 'Экспорт в ONNX и INT8 Квантование',
  subtitle: 'Сжатие модели с 90 МБ до 14.8 МБ и ускорение на CPU в 4 раза через AVX-512 VNNI',
  duration: '20 мин',
  iconName: 'Minimize2',
  category: 'prod',
  overview: {
    problemTitle: 'Громоздкость PyTorch в микросервисной архитектуре и задержки CI/CD',
    problemDescription:
      'Обученная модель PyTorch сохраняется в файл чекпоинта `.pt` размером около 90 МБ. Для запуска инференса требуется окружение Python, установленный PyTorch (около 2.5 ГБ зависимостей на диске) и тяжелые runtime библиотеки. В микросервисной архитектуре uncflow сканирование кода выполняется прямо внутри легковесных контейнеров или пайплайнов CI/CD. Докеризация PyTorch раздувает образ до 3+ ГБ, а запуск Python интерпретатора добавляет накладные расходы в 200–400 мс на инициализацию, что неприемлемо для микросервиса.',
    solutionTitle: 'Кросс-платформенный формат ONNX и динамическое INT8 квантование',
    solutionDescription:
      'Мы компилируем обученный граф PyTorch в открытый бинарный формат ONNX (Open Neural Network Exchange). Затем мы выполняем динамическое квантование весов: каждое 32-битное число с плавающей точкой (FP32, 4 байта) пересчитывается в 8-битное целое число (INT8, 1 байт). Размер бинарника сжимается ровно в 4 раза — с ~60 МБ до 14.8 МБ, а процессор переключается на целочисленные SIMD-инструкции AVX-512 VNNI, ускоряя вычисления в 3–5 раз!',
    deepExplanation: [
      'Что такое ONNX Runtime? Это сверхбыстрый высокопроизводительный движок на чистом C++, оптимизированный корпорациями Microsoft и Intel. Он не требует установки Python, потребляет считанные мегабайты памяти и поддерживает привязки к Node.js, Go, Rust и Java.',
      'Динамическое квантование (Dynamic Quantization): веса модели (Weights) квантуются заранее статически в int8, а активации (Inputs) квантуются на лету во время выполнения каждого метода.',
      'Шкала и смещение нуля (Scale & Zero-Point): математическая формула q = round(x / S) + Z преобразует непрерывный интервал [x_min, x_max] в 256 дискретных целых уровней [-128, 127] практически без потери точности предсказания (деградация F2-score < 0.2%).'
    ],
    realWorldPitfalls: [
      'Жесткие размеры тензоров при экспорте: если при экспорте `torch.onnx.export` не указать `dynamic_axes`, скомпилированная модель сможет обрабатывать методы строго фиксированной длины (например, ровно 64 токена) и будет падать с ошибкой на реальном коде.',
      'Квантование слоев нормализации: квантовать LayerNorm в INT8 не рекомендуется, так как вычисление дисперсии требует высокой точности. Мы квантуем только тяжелые линейные слои и LSTM.'
    ],
    productionTip: 'Файл `appsec_classifier.onnx` размером 14.8 МБ можно коммитить прямо в Git LFS или запекать в микросервисный Docker образ на базе Alpine Linux размером всего 85 МБ!'
  },
  mathematics: {
    headline: 'Математика Аффинного Квантования FP32 -> INT8',
    summary:
      'Линейное отображение непрерывных вещественных чисел в дискретный диапазон 8-битных знаковых целых чисел.',
    formulas: [
      {
        name: 'Формула прямого квантования (FP32 -> INT8)',
        latex: 'q = \\text{clamp}\\left(\\text{round}\\left(\\frac{x}{S}\\right) + Z, -128, 127\\right)',
        meaning: 'Отображение вещественного числа x в байт q',
        variables: [
          { symbol: 'x ∈ [x_min, x_max]', desc: 'Исходный вещественный вес FP32' },
          { symbol: 'S = (x_max - x_min) / 255', desc: 'Масштабный коэффициент (Scale)' },
          { symbol: 'Z = round(-x_min / S) - 128', desc: 'Смещение нуля (Zero-Point)' }
        ]
      },
      {
        name: 'Де-квантование (Восстановление значения)',
        latex: '\\hat{x} = S \\cdot (q - Z), \\quad |x - \\hat{x}| < \\frac{S}{2}',
        meaning: 'Быстрое восстановление вещественного числа с контролируемой погрешностью',
        variables: [
          { symbol: 'x̂', desc: 'Восстановленное значение' },
          { symbol: 'q', desc: 'Целочисленный 8-битный байт из памяти' }
        ]
      }
    ],
    numericWalkthrough: {
      title: 'Расчет сжатия веса FP32 в 8-битный байт',
      inputData: 'Диапазон весов слоя: от x_min = -2.0 до x_max = +2.0. Требуется квантовать вес x = 0.75.',
      calculationSteps: [
        'Шаг 1: Шаг сетки (Scale): S = (2.0 - (-2.0)) / 255 = 4.0 / 255 ≈ 0.015686',
        'Шаг 2: Смещение нуля: Z = round(-(-2.0) / 0.015686) - 128 = round(127.5) - 128 = 128 - 128 = 0',
        'Шаг 3: Деление на шаг: x / S = 0.75 / 0.015686 ≈ 47.81',
        'Шаг 4: Округление в целое: q = round(47.81) + 0 = 48 (укладывается в 1 байт INT8!)',
        'Шаг 5: Проверка де-квантования: x̂ = 0.015686 * (48 - 0) = 0.7529'
      ],
      result: 'Исходное число 0.75 сжато в байт 48. Погрешность восстановления всего |0.75 - 0.7529| = 0.0029!',
      engineeringInsight: 'Погрешность 0.0029 совершенно незаметна для нейросети, но экономит 75% оперативной памяти.'
    }
  },
  code: {
    language: 'python',
    filename: 'export_and_quantize.py',
    description: 'Производственный скрипт компиляции в ONNX и динамического квантования модели до 15 МБ.',
    snippet: `import torch
import os
from onnxruntime.quantization import quantize_dynamic, QuantType

def export_to_onnx_and_quantize(
    model: torch.nn.Module,
    fp32_output_path: str = "appsec_model_fp32.onnx",
    int8_output_path: str = "appsec_model_int8.onnx"
):
    model.eval()
    
    # Создаем фиктивные тензоры для трассировки графа вычислений
    dummy_tokens = torch.randint(0, 1000, (1, 64), dtype=torch.long)
    dummy_mask = torch.ones((1, 64), dtype=torch.long)
    dummy_meta = torch.randn((1, 12), dtype=torch.float32)

    # 1. Экспорт в ONNX со свободными (динамическими) размерностями батча и токенов
    torch.onnx.export(
        model,
        (dummy_tokens, dummy_mask, dummy_meta),
        fp32_output_path,
        export_params=True,
        opset_version=14,
        do_constant_folding=True, # Сворачивание константных выражений
        input_names=['token_ids', 'mask', 'metadata'],
        output_names=['prob_vuln', 'logits_cwe'],
        dynamic_axes={
            'token_ids': {0: 'batch_size', 1: 'seq_len'},
            'mask': {0: 'batch_size', 1: 'seq_len'},
            'metadata': {0: 'batch_size'}
        }
    )
    fp32_size = os.path.getsize(fp32_output_path) / (1024 * 1024)
    print(f"✅ Экспорт в FP32 ONNX завершен! Размер: {fp32_size:.1f} МБ")

    # 2. Динамическое квантование в INT8 (сжатие тяжелых линейных слоев)
    quantize_dynamic(
        model_input=fp32_output_path,
        model_output=int8_output_path,
        weight_type=QuantType.QInt8,
        optimize_model=True
    )
    int8_size = os.path.getsize(int8_output_path) / (1024 * 1024)
    print(f"🚀 Квантование в INT8 завершено! Размер: {int8_size:.1f} МБ (Сжатие: {fp32_size/int8_size:.1f}x)")

if __name__ == "__main__":
    from dual_branch_appsec_net import DualBranchAppSecNet
    net = DualBranchAppSecNet()
    export_to_onnx_and_quantize(net)
`,
    lineExplanations: [
      { lines: '18-32', comment: 'Экспорт графа с dynamic_axes для поддержки любой длины методов кода' },
      { lines: '37-43', comment: 'Динамическое квантование весов весовым типом QuantType.QInt8' },
      { lines: '44-46', comment: 'Фиксация размера модели ~14.8 МБ и расчет коэффициента компрессии 4x' }
    ],
    architectureNote: 'Файл appsec_model_int8.onnx готов к мгновенному подключению в TypeScript сервис uncflow.'
  },
  quiz: {
    questions: [
      {
        id: 'q9-1',
        question: 'Сколько байт памяти экономится на 1 миллионе параметров нейросети при переходе с FP32 на INT8?',
        options: [
          'Ровно 100 КБ',
          'Ровно 3 Мегабайта: в FP32 1 млн параметров занимает 4 МБ, а в INT8 — всего 1 МБ (экономия 75%)',
          'Память не экономится, меняется только скорость',
          'Ровно 1 Гигабайт'
        ],
        correctAnswer: 1,
        explanation: 'Число float32 занимает 4 байта (32 бита). Число int8 занимает ровно 1 байт (8 бит). 1 000 000 * 4 = 4 МБ, 1 000 000 * 1 = 1 МБ. Экономия составляет ровно 3 МБ (в 4 раза).'
      },
      {
        id: 'q9-2',
        question: 'Что произойдет, если при экспорте в ONNX забыть параметр `dynamic_axes`?',
        options: [
          'Скрипт экспорта выдаст ошибку SyntaxError',
          'Модель сможет принимать на вход только методы строго той же длины, что и dummy_tokens при экспорте, а на методах другой длины упадет с ошибкой несовпадения размерностей',
          'Модель автоматически переобучится на новые языки программирования',
          'Файл ONNX не запишется на диск'
        ],
        correctAnswer: 1,
        explanation: 'Без `dynamic_axes` компилятор фиксирует размеры матриц как статические константы. Указание `dynamic_axes` делает размерности батча и длины последовательности открытыми переменными.'
      }
    ],
    task: {
      title: 'Расчет Scale для слоя весов',
      description: 'Веса слоя квантования распределены в диапазоне от x_min = -1.5 до x_max = +1.5. Найди масштабный коэффициент S (Scale) для 8-битного диапазона из 255 градаций.',
      hints: [
        'Формула: S = (x_max - x_min) / 255'
      ],
      solution: 'S = (1.5 - (-1.5)) / 255 = 3.0 / 255 ≈ 0.0117647.',
      explanation: 'Каждая единица 8-битного целого числа соответствует примерно 0.01176 исходного вещественного веса.'
    }
  }
};
