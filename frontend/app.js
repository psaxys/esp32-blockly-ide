import { ESPLoader, Transport } from 'https://unpkg.com/esptool-js@0.5.0/bundle.js';

const workspace = Blockly.inject('blocklyDiv', {
    toolbox: document.getElementById('toolbox'),
    media: 'https://unpkg.com/blockly/media/'
});

// Функция генерации полного кода
function generateFullCode() {
    const code = Blockly.JavaScript.workspaceToCode(workspace);
    const includes = Object.values(Blockly.JavaScript.definitions_ || {}).join('\n');
    return `#include <Arduino.h>\n${includes}\n\nvoid setup() {\n  Serial.begin(115200);\n${code}\n}\n\nvoid loop() {}`;
}

// Кнопка просмотра кода
document.getElementById('btnViewCode').onclick = () => {
    const codePanel = document.getElementById('codeView');
    document.getElementById('codePre').innerText = generateFullCode();
    codePanel.style.display = 'block';
};

// Прошивка
document.getElementById('btnFlash').onclick = async () => {
    const status = document.getElementById('status');
    try {
        status.innerText = "Компиляция...";
        const response = await fetch('http://localhost:3000/compile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: generateFullCode() })
        });
        const blob = await response.blob();
        
        status.innerText = "Подключите ESP32...";
        const port = await navigator.serial.requestPort();
        const transport = new Transport(port);
        const esploader = new ESPLoader(transport, 115200);
        await esploader.main_fn();
        
        status.innerText = "Запись прошивки...";
        await esploader.write_flash({
            fileArray: [{ data: await blob.arrayBuffer(), address: 0x0 }],
            flash_size: 'keep'
        });
        status.innerText = "Готово!";
    } catch (e) {
        status.innerText = "Ошибка: " + e.message;
    }
};
