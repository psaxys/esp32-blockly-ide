FROM python:3.9-slim

WORKDIR /app

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    git \
    curl \
    build-essential \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Копирование зависимостей
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копирование исходного кода
COPY . .

# Создание папки для проектов
RUN mkdir -p /app/projects

EXPOSE 5000

CMD ["python", "app.py"]
