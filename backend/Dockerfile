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
    && rm -rf /var/lib/apt/lists/*

# Установка Node.js для работы с Blockly
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest

# Копирование зависимостей
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копирование исходного кода
COPY . .

# Создание необходимых папок
RUN mkdir -p /app/projects /app/blockly-assets

EXPOSE 5000

CMD ["python", "app.py"]
