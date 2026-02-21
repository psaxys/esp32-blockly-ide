FROM node:18-bullseye-slim

WORKDIR /usr/src/app
ENV PATH="/opt/pio/bin:/usr/local/bin:${PATH}"

# Debian base нужен для совместимости ESP32 toolchain (xtensa-esp32-elf-g++)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-venv \
    python3-pip \
    make \
    gcc \
    g++ \
    bash \
    curl \
    git \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# PlatformIO + ESP32 platform/toolchain в venv
RUN python3 -m venv /opt/pio \
    && /opt/pio/bin/pip install --no-cache-dir --upgrade pip \
    && /opt/pio/bin/pip install --no-cache-dir platformio==6.1.11 \
    && /opt/pio/bin/pio platform install espressif32@6.9.0

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
