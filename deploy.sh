#!/bin/bash
set -e

echo "🛡️ uncflow ML Academy — Автоматический деплой"
echo "🌐 Целевой домен: https://timops.duckdns.org"

# Если на сервере запущен дефолтный системный Nginx (который выдает 'Welcome to nginx'),
# освобождаем порты 80 и 443 для нашего контейнера:
if systemctl is-active --quiet nginx 2>/dev/null; then
    echo "⚠️ Остановка системного Nginx для освобождения портов 80 и 443..."
    sudo systemctl stop nginx
    sudo systemctl disable nginx
fi

echo "🚀 Запуск Docker Compose..."
docker compose up -d --build

echo ""
echo "🎉 Готово! Контейнер успешно запущен."
echo "🔒 SSL сертификат Let's Encrypt будет получен автоматически."
echo "👉 Открывай сайт: https://timops.duckdns.org"
