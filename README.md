# 🛡️ UNCFLOW ML ACADEMY
> **Интерактивный учебник-роадмап по разработке компактной двухпоточной нейросети для AppSec и фильтрации False Positives**

Веб-приложение доступно по домену: **https://timops.duckdns.org/**

## 🚀 Быстрый запуск на сервере (Docker Compose)

Никаких ручных правок конфигов Nginx не требуется:

```bash
# 1. Если на сервере висит старый дефолтный Nginx, освобождаем порты 80 и 443:
sudo systemctl stop nginx && sudo systemctl disable nginx

# 2. Запускаем контейнер (SSL Let's Encrypt выпустится автоматически):
docker compose up -d --build
```

Или выполни готовый скрипт:
```bash
chmod +x deploy.sh && ./deploy.sh
```

---

## 💻 Локальная разработка

```bash
npm install
npm run dev
```
Открой: `http://localhost:3000`
