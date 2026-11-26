# 🚀 Инструкция по сборке и деплою UNCFLOW ML ACADEMY

Интерактивное веб-приложение создано на стеке **React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion** и оптимизировано для работы в микросервисной инфраструктуре `uncflow`.

---

## 💻 1. Локальный запуск для разработки

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера с HMR на порту 3000
npm run dev
```

Открой в браузере: `http://localhost:3000`

---

## 📦 2. Сборка продакшен-бандла без Docker

```bash
# Проверка типов и сборка в папку dist/
npm run build

# Предпросмотр продакшен сборки
npm run preview
```

Скомпилированные статические файлы будут находиться в папке `dist/`. Их можно загрузить на любой хостинг статики (Nginx, Caddy, Vercel, Netlify, S3 + CloudFront).

---

## 🐳 3. Деплой через Docker и Docker Compose (Рекомендуется для сервера)

В проект включен оптимизированный multi-stage Dockerfile:
1. Сборка React-бандла в контейнере `node:20-alpine`.
2. Раздача легковесным веб-сервером `nginx:alpine` (размер итогового образа всего **~25 МБ**).
3. Включен Gzip-сжатие, кэширование статических файлов и SPA-маршрутизация.

### Запуск через Docker Compose:
```bash
# Собрать и запустить контейнер в фоне на порту 8080
docker compose up -d --build

# Проверка статуса контейнера
docker compose ps

# Просмотр логов
docker compose logs -f
```

Сайт сразу станет доступен по адресу: `http://твой-сервер-ip:8080`

### Остановка контейнера:
```bash
docker compose down
```

---

## 🌐 4. Подключение домена и SSL (Nginx Reverse Proxy / Certbot)

Если ты хочешь привязать домен (например, `academy.uncflow.io`) с бесплатным SSL-сертификатом от Let's Encrypt:

Пример конфигурации внешнего Nginx на хосте (`/etc/nginx/sites-available/academy.uncflow.io`):

```nginx
server {
    listen 80;
    server_name academy.uncflow.io;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Активация SSL:
```bash
sudo certbot --nginx -d academy.uncflow.io
```

---

## 🛡️ 5. Особенности микросервисной интеграции
- **Автономность:** Приложение полностью клиентское (SPA), не требует постоянного Python бэкенда для демонстрации уроков и работы всех 10 интерактивных песочниц.
- **Сохранение прогресса:** Прогресс студентов и ответы на тесты сохраняются в `localStorage` браузера пользователя.
- **Web Audio API:** Звуковые микро-эффекты синтезируются локально в браузере, не расходуя трафик на загрузку аудио-файлов.
