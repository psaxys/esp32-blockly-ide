# Базовый образ Node.js
FROM node:18-slim

# Установка системных зависимостей для arduino-cli
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    python3-pip \
    git \
    && rm -rf /var/lib/apt/lists/*

# Установка arduino-cli
RUN curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh

# Настройка Arduino CLI
RUN arduino-cli config init

# Добавляем URL для ядер ESP32
RUN arduino-cli config set board_manager.additional_urls https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json

# Обновляем индекс ядер
RUN arduino-cli core update-index

# Устанавливаем ядро ESP32 (версия esp32:esp32)
RUN arduino-cli core install esp32:esp32

# --- УСТАНОВКА БИБЛИОТЕК ---
# Здесь мы ставим все библиотеки, которые используем в blocks.js
RUN arduino-cli lib install \
    "Adafruit SSD1306" \
    "Adafruit GFX Library" \
    "DHT sensor library" \
    "Adafruit Unified Sensor" \
    "LiquidCrystal I2C" \
    "ESP32Servo" \
    "LittleFS_esp32"

# Настройка рабочей директории приложения
WORKDIR /app

# Копируем package.json (если есть) и ставим зависимости node
COPY package.json .
RUN npm install

# Копируем исходный код сервера (server.js)
COPY . .

# Открываем порт
EXPOSE 3000

# Запускаем сервер
CMD ["node", "server.js"]
