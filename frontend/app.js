import { ESPLoader, Transport } from 'https://unpkg.com/esptool-js@0.5.0/bundle.js';

const workspace = Blockly.inject('blocklyDiv', {
    toolbox: document.getElementById('toolbox'),
    media: 'https://unpkg.com/blockly/media/',
    scrollbars: true
});

function generateFullCPP() {
    // Важно: инициализируем генератор для текущего workspace
    javascriptGenerator.init(workspace);
    
    // Генерируем код всех блоков
    javascriptGenerator.workspaceToCode(workspace);
    
    // Находим блок структуры
    const mainBlock = workspace.getAllBlocks(false).find(b => b.type === 'esp32_main_structure');
    
    const setupPart = mainBlock ? mainBlock.generatedSetup : "";
    const loopPart = mainBlock ? mainBlock.generatedLoop : "";
    const defs = Object.values(javascriptGenerator.definitions_ || {}).join('\n');
    
    return `#include <Arduino.h>\n\n${defs}\n\nvoid setup() {\n  Serial.begin(115200);\n${setupPart}\n}\n\nvoid loop() {\n${loopPart}\n  delay(1);\n}`;
}

// Кнопка просмотра кода
document.getElementById('btnViewCode').onclick = () => {
    const fullCode = generateFullCPP();
    document.getElementById('codeOutput').innerText = fullCode;
    document.getElementById('codeModal').style.display = 'block';
};

// Кнопка прошивки
document.getElementById('btnFlash').onclick = async () => {
    const status = document.getElementById('status');
    try {
        const code = generateFullCPP();
        status.innerText = "⏳ Компиляция на сервере...";
        
        const res = await fetch('http://localhost:3000/compile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });
        
        if (!res.ok) throw new Error(await res.text());
        const blob = await res.blob();
        
        status.innerText = "🔌 Выберите ESP32 в списке...";
        const port = await navigator.serial.requestPort();
        const transport = new Transport(port);
        const esploader = new ESPLoader(transport, 115200);
        
        await esploader.main_fn();
        status.innerText = "💾 Запись прошивки...";
        
        await esploader.write_flash({
            fileArray: [{ data: await blob.arrayBuffer(), address: 0x10000 }],
            flash_size: 'keep'
        });
        
        status.innerText = "✅ Готово! Программа запущена.";
    } catch (e) {
        status.innerText = "❌ Ошибка: " + e.message;
        console.error(e);
    }
};
