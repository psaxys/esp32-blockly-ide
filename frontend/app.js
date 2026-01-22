// app.js
import { ESPLoader, Transport } from 'https://unpkg.com/esptool-js@0.5.0/bundle.js';

const workspace = Blockly.inject('blocklyDiv', {
    toolbox: document.getElementById('toolbox'),
    media: 'https://unpkg.com/blockly/media/',
    scrollbars: true,
    zoom: { controls: true, wheel: true }
});

function generateFullCPP() {
    // 1. Инициализация (сбрасывает definitions_ и настраивает переменные)
    javascriptGenerator.init(workspace);
    
    // 2. Генерация (заполняет definitions_ и превращает блоки в код)
    // Мы вызываем это, чтобы сработали все функции forBlock
    javascriptGenerator.workspaceToCode(workspace);
    
    // 3. Сбор данных из специального блока структуры
    const mainBlock = workspace.getAllBlocks(false).find(b => b.type === 'esp32_main_structure');
    
    if (!mainBlock) {
        alert("Пожалуйста, добавьте блок 'ПРОГРАММА ESP32' на поле!");
        return null;
    }

    const setupPart = mainBlock.userData ? mainBlock.userData.setup : "";
    const loopPart = mainBlock.userData ? mainBlock.userData.loop : "";
    
    // Собираем все инклюды и переменные
    const defs = Object.values(javascriptGenerator.definitions_ || {}).join('\n');
    
    return `
#include <Arduino.h>

${defs}

void setup() {
  Serial.begin(115200);
  ${setupPart}
}

void loop() {
  ${loopPart}
  delay(1); 
}
`;
}

// Показ кода
document.getElementById('btnViewCode').onclick = () => {
    const code = generateFullCPP();
    if (code) {
        document.getElementById('codeOutput').innerText = code;
        document.getElementById('codeModal').style.display = 'block';
    }
};

// Прошивка (Flash)
document.getElementById('btnFlash').onclick = async () => {
    const status = document.getElementById('status');
    try {
        const code = generateFullCPP();
        if (!code) return;

        status.innerText = "⏳ Компиляция...";
        const res = await fetch('http://localhost:3000/compile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });
        
        if (!res.ok) throw new Error(await res.text());
        const blob = await res.blob();
        
        status.innerText = "🔌 Подключите ESP32...";
        const port = await navigator.serial.requestPort();
        const transport = new Transport(port);
        const esploader = new ESPLoader(transport, 115200);
        
        await esploader.main_fn();
        status.innerText = "💾 Загрузка...";
        
        await esploader.write_flash({
            fileArray: [{ data: await blob.arrayBuffer(), address: 0x10000 }],
            flash_size: 'keep'
        });
        
        status.innerText = "✅ Готово!";
    } catch (e) {
        status.innerText = "❌ Ошибка: " + e.message;
        console.error(e);
    }
};
