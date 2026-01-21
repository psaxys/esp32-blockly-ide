import { ESPLoader, Transport } from 'https://unpkg.com/esptool-js@0.5.0/bundle.js';

const workspace = Blockly.inject('blocklyDiv', {
    toolbox: document.getElementById('toolbox'),
    media: 'https://unpkg.com/blockly/media/'
});

// Функция для сборки чистого C++ кода
function getFullCode() {
    Blockly.JavaScript.init(workspace);
    const code = Blockly.JavaScript.workspaceToCode(workspace);
    const definitions = Object.values(Blockly.JavaScript.definitions_ || {}).join('\n');
    return `#include <Arduino.h>\n${definitions}\n\nvoid setup() {\n  Serial.begin(115200);\n${code}\n}\n\nvoid loop() {\n  // loop code can be added with specific loop blocks if needed\n}\n`;
}

// Показать код пользователю
document.getElementById('btnViewCode').onclick = () => {
    document.getElementById('codeOutput').innerText = getFullCode();
    document.getElementById('codeModal').style.display = 'block';
};

// Логика прошивки
document.getElementById('btnFlash').onclick = async () => {
    const statusEl = document.getElementById('status');
    try {
        statusEl.innerText = "Статус: Компиляция на сервере...";
        const response = await fetch('http://localhost:3000/compile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: getFullCode() })
        });

        if (!response.ok) throw new Error("Ошибка компиляции на сервере.");
        const blob = await response.blob();
        
        statusEl.innerText = "Статус: Подключитесь к ESP32...";
        const port = await navigator.serial.requestPort();
        const transport = new Transport(port);
        const esploader = new ESPLoader(transport, 115200);
        
        await esploader.main_fn();
        statusEl.innerText = "Статус: Идет прошивка...";
        
        await esploader.write_flash({
            fileArray: [{ data: await blob.arrayBuffer(), address: 0x0 }],
            flash_size: 'keep'
        });
        
        statusEl.innerText = "Статус: Успешно прошито!";
    } catch (err) {
        statusEl.innerText = "Ошибка: " + err.message;
        console.error(err);
    }
};
