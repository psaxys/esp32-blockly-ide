FROM node:18-alpine

WORKDIR /usr/src/app
ENV PATH="/opt/pio/bin:/usr/local/bin:${PATH}"

# Установка системных зависимостей
RUN apk add --no-cache \
    python3 \
    py3-pip \
    make \
    gcc \
    g++ \
    linux-headers \
    bash \
    curl \
    git \
    libstdc++

# Устанавливаем PlatformIO в venv (PEP 668 compatible для Alpine)
RUN python3 -m venv /opt/pio \
    && /opt/pio/bin/pip install --no-cache-dir --upgrade pip \
    && /opt/pio/bin/pip install --no-cache-dir platformio==6.1.11 \
    && /opt/pio/bin/pio pkg install -g -p espressif32

# Копирование файлов проекта
COPY backend/package*.json ./backend/
COPY frontend ./frontend/

# Установка Node.js зависимостей в папке backend
WORKDIR /usr/src/app/backend
RUN npm install --production

# Создание необходимых директорий
WORKDIR /usr/src/app
RUN mkdir -p /usr/src/app/workspaces \
    && mkdir -p /usr/src/app/examples

# Финальная рабочая директория для запуска сервера
WORKDIR /usr/src/app/backend

# Открытие порта
EXPOSE 8080

# Запуск приложения
CMD ["node", "server.js"]
