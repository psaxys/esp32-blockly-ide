// Импорт ES Module библиотеки esptool
import { ESPLoader, Transport } from 'https://unpkg.com/esptool-js@0.5.0/bundle.js';

// Инициализация Blockly
const workspace = Blockly.inject('blocklyDiv', {
    toolbox: document.getElementById('toolbox'),
    media: 'https://unpkg.com/blockly/media/',
    scrollbars: true,
    zoom: { controls: true, wheel: true }
});

// Функция для формирования полного кода Arduino C++
function generateFullSourceCode() {
    // 1. Обязательно инициализируем генератор перед работой
    Blockly.JavaScript.init(workspace);
    
    // 2. Получаем код из блоков (тело программы)
    const blocksCode = Blockly.JavaScript.workspaceToCode(workspace);
    
    // 3. Собираем все определения (глобальные переменные, инклуды, функции ISR)
    let definitions = "";
    if (Blockly.JavaScript.definitions_) {
        definitions = Object.values(Blockly.JavaScript.definitions_).join('\n');
    }
    
    // 4. Собираем финальный шаблон
    const fullCode = `
#include <Arduino.h>

// --- Definitions & Libraries ---
${definitions}

void setup() {
  Serial.begin(115200);
  // Инициализация LittleFS для блоков хранилища, если нужно
  // LittleFS.begin();
  
  // Код, который генерируется блоками
  ${blocksCode}
}

void loop() {
  // В этой версии Blockly весь код падает в setup, если не использовать спец. блоки цикла.
  // Это нормально для простых скриптов.
  delay(10); // Watchdog prevent
}
`;
    return fullCode;
}

// Обработчик кнопки "ПОСМОТРЕТЬ КОД"
document.getElementById('btnViewCode').onclick = () => {
    const code = generateFullSourceCode();
    const outputElem = document.getElementById('codeOutput');
    const modalElem = document.getElementById('codeModal');
    
    outputElem.innerText = code;
    modalElem.style.display = 'block';
};

// Обработчик кнопки "ПРОШИТЬ"
document.getElementById('btnFlash').onclick = async () => {
    const statusEl = document.getElementById('status');
    const code = generateFullSourceCode();
    
    try {
        // ЭТАП 1: Компиляция на сервере
        statusEl.innerText = "⏳ Компиляция...";
        console.log("Отправка кода на компиляцию...");
        
        const response = await fetch('http://localhost:3000/compile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error("Ошибка сборки: " + errText);
        }

        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();

        // ЭТАП 2: Прошивка через Web Serial
        statusEl.innerText = "🔌 Выберите порт...";
        
        const port = await navigator.serial.requestPort();
        const transport = new Transport(port);
        const esploader = new ESPLoader(transport, 115200, null); // 115200 - скорость прошивки

        statusEl.innerText = "📡 Подключение к чипу...";
        await esploader.main_fn();
        await esploader.flash_id();

        statusEl.innerText = "💾 Запись во флеш-память...";
        
        // Запись бинарного файла по адресу 0x10000 (стандарт для Arduino ESP32)
        // Для некоторых загрузчиков может потребоваться 0x0 или набор из 4 файлов (bootloader и т.д.)
        // В рамках Docker arduino-cli обычно делает merged bin.
        await esploader.write_flash({
            fileArray: [{ data: arrayBuffer, address: 0x10000 }],
            flash_size: 'keep',
            erase_all: false,
            compress: true,
        });

        statusEl.innerText = "✅ Готово! Перезагрузите ESP32.";
        
    } catch (e) {
        console.error(e);
        statusEl.innerText = "❌ Ошибка: " + e.message;
        alert("Ошибка: " + e.message);
    }
};
