const workspace = Blockly.inject('blocklyDiv', {
    toolbox: document.getElementById('toolbox'),
    media: 'https://unpkg.com/blockly/media/'
});

async function compileAndFlash() {
    const statusEl = document.getElementById('status');
    statusEl.innerText = "Генерация кода...";

    // 1. Собираем код из блоков
    const generatedCode = Blockly.JavaScript.workspaceToCode(workspace);
    const fullCode = `
#include <Arduino.h>
void setup() {
  Serial.begin(115200);
  ${generatedCode}
}
void loop() {}
    `;

    try {
        // 2. Отправка на бэкенд для компиляции
        statusEl.innerText = "Компиляция на сервере (может занять 10-20 сек)...";
        const response = await fetch('http://localhost:3000/compile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: fullCode })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error("Ошибка компиляции: " + errorText);
        }

        const blob = await response.blob();
        statusEl.innerText = "Компиляция успешна! Выберите порт ESP32...";

        // 3. Работа с Web Serial и esptool-js
        const port = await navigator.serial.requestPort();
        const transport = new esptooljs.Transport(port);
        const esploader = new esptooljs.ESPLoader(transport, 115200);

        statusEl.innerText = "Подключение к ESP32...";
        await esploader.main_fn();

        statusEl.innerText = "Запись прошивки (Flash)...";
        await esploader.write_flash({
            fileArray: [{ data: await blob.arrayBuffer(), address: 0x0 }],
            flash_size: 'keep',
            reportProgress: (fileIndex, written, total) => {
                statusEl.innerText = `Прошивка: ${Math.round(written/total*100)}%`;
            }
        });

        statusEl.innerText = "Готово! Контроллер перезагружен.";
        await transport.disconnect();

    } catch (err) {
        console.error(err);
        statusEl.innerText = "Ошибка: " + err.message;
        alert(err.message);
    }
}
