# ESP32 Scratch-like Web IDE

Полнофункциональная среда визуального программирования для ESP32 с компиляцией в облаке и прошивкой через Web Serial API.

### Особенности:
- **Blockly Interface**: Генерация чистого C++ кода (Arduino Core).
- **Cloud Compilation**: Компиляция через Docker контейнер с `arduino-cli`.
- **Direct Flashing**: Загрузка кода в контроллер прямо из Chrome/Edge.
- **Auto-Library Sync**: Автоматическая установка библиотек на сервере.

### Как запустить:
1. Клонируйте репозиторий.
2. Запустите бэкенд: `docker-compose up -d`.
3. Откройте `frontend/index.html` в браузере с поддержкой Web Serial.
