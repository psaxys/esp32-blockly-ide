FROM node:18-alpine

WORKDIR /usr/src/app

# Установка зависимостей
RUN apk add --no-cache \
    python3 \
    py3-pip \
    make \
    gcc \
    g++ \
    linux-headers \
    bash \
    curl \
    git

# Копирование файлов
COPY backend/package*.json ./backend/
COPY frontend ./frontend/

# Установка Node.js зависимостей
WORKDIR /usr/src/app/backend
RUN npm install --production

# Создание директорий
RUN mkdir -p /usr/src/app/workspaces \
    && mkdir -p /usr/src/app/examples

# Открытие порта
EXPOSE 8080

# Запуск приложения
CMD ["node", "server.js"]
