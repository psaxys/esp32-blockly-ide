# Используем легкий образ Node.js
FROM node:18-slim

# Устанавливаем зависимости для работы arduino-cli и прошивки
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем arduino-cli
RUN curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh

# Инициализируем конфиг и добавляем поддержку ESP32
RUN arduino-cli config init
RUN arduino-cli config set board_manager.additional_urls https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json

# Обновляем индексы и устанавливаем платформу ESP32
RUN arduino-cli core update-index
RUN arduino-cli core install esp32:esp32

# --- УСТАНОВКА БИБЛИОТЕК ДЛЯ ВАШИХ БЛОКОВ ---
RUN arduino-cli lib install "Adafruit SSD1306" \
    "Adafruit GFX Library" \
    "DHT sensor library" \
    "Adafruit Unified Sensor" \
    "LiquidCrystal I2C" \
    "ESP32Servo"

# Создаем рабочую директорию
WORKDIR /app

# Копируем package.json и устанавливаем зависимости Node.js
COPY package.json .
RUN npm install

# Копируем исходный код сервера
COPY . .

# Открываем порт
EXPOSE 3000

# Запускаем сервер
CMD ["node", "server.js"]
