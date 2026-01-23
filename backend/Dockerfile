FROM python:3.11-slim

WORKDIR /app

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    build-essential \
    python3-pip \
    libssl-dev \
    libffi-dev \
    ca-certificates \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Установка Node.js 20.x (совместимой с npm 11.8.0)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@10.5.0  # Устанавливаем совместимую версию npm

# Проверка версий
RUN node --version && npm --version

# Копирование зависимостей
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копирование исходного кода
COPY . .

# Создание необходимых папок
RUN mkdir -p /app/projects /app/blockly-assets

EXPOSE 5000

CMD ["python", "app.py"]
