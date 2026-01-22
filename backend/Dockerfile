FROM node:18-slim

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    curl python3 python3-pip git \
    && rm -rf /var/lib/apt/lists/*

# Установка arduino-cli
RUN curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh

# Настройка платформ ESP32
RUN arduino-cli config init
RUN arduino-cli config set board_manager.additional_urls https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
RUN arduino-cli core update-index
RUN arduino-cli core install esp32:esp32

# Установка библиотек для датчиков, дисплеев и моторов
RUN arduino-cli lib install \
    "Adafruit SSD1306" \
    "Adafruit GFX Library" \
    "DHT sensor library" \
    "Adafruit Unified Sensor" \
    "ESP32Servo" \
    "LittleFS_esp32"

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
