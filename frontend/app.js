import { ESPLoader, Transport } from 'https://unpkg.com/esptool-js@0.5.0/bundle.js';

// Ждем полной загрузки DOM и внешних скриптов Blockly
window.addEventListener('load', () => {
    
    // ПРОВЕРКА: Если скрипт Blockly еще не подгрузился, пробуем подождать
    if (typeof javascriptGenerator === 'undefined') {
        console.error("Генератор не найден. Проверьте интернет-соединение.");
        return;
    }

    // Инициализация блоков (вместо отдельного файла подключаем функцию)
    initCustomBlocks();

    const workspace = Blockly.inject('blocklyDiv', {
        toolbox: document.getElementById('toolbox'),
        media: 'https://unpkg.com/blockly/media/',
        scrollbars: true
    });

    function generateFullCPP() {
        const jsg = javascriptGenerator;
        jsg.init(workspace);
        
        // Генерация кода для всех блоков в workspace
        jsg.workspaceToCode(workspace);
        
        const mainBlock = workspace.getAllBlocks(false).find(b => b.type === 'esp32_main_structure');
        if (!mainBlock) {
            alert("Добавьте блок 'ПРОГРАММА ESP32'!");
            return null;
        }

        const setupPart = mainBlock.userData ? mainBlock.userData.setup : "";
        const loopPart = mainBlock.userData ? mainBlock.userData.loop : "";
        const defs = Object.values(jsg.definitions_ || {}).join('\n');
        
        return `#include <Arduino.h>\n\n${defs}\n\nvoid setup() {\n  Serial.begin(115200);\n${setupPart}\n}\n\nvoid loop() {\n${loopPart}\n  delay(1);\n}`;
    }

    // Обработчики кнопок
    document.getElementById('btnViewCode').onclick = () => {
        const code = generateFullCPP();
        if (code) {
            document.getElementById('codeOutput').innerText = code;
            document.getElementById('codeModal').style.display = 'block';
        }
    };

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
            
            status.innerText = "🔌 Подключение...";
            const port = await navigator.serial.requestPort();
            const transport = new Transport(port);
            const esploader = new ESPLoader(transport, 115200);
            await esploader.main_fn();
            
            status.innerText = "💾 Прошивка...";
            await esploader.write_flash({
                fileArray: [{ data: await blob.arrayBuffer(), address: 0x10000 }],
                flash_size: 'keep'
            });
            status.innerText = "✅ Успешно!";
        } catch (e) {
            status.innerText = "❌ Ошибка";
            console.error(e);
        }
    };
});

// Функция регистрации блоков внутри app.js (гарантирует наличие javascriptGenerator)
function initCustomBlocks() {
    const jsg = javascriptGenerator;

    // Главная структура
    Blockly.Blocks['esp32_main_structure'] = {
        init: function() {
            this.appendDummyInput().appendField("⚙️ ПРОГРАММА ESP32");
            this.appendStatementInput("SETUP").setCheck(null).appendField("Setup:");
            this.appendStatementInput("LOOP").setCheck(null).appendField("Loop:");
            this.setColour(285);
        }
    };
    jsg.forBlock['esp32_main_structure'] = function(block, generator) {
        block.userData = {
            setup: generator.statementToCode(block, 'SETUP'),
            loop: generator.statementToCode(block, 'LOOP')
        };
        return "";
    };

    // Delay
    Blockly.Blocks['esp32_delay'] = {
        init: function() {
            this.appendDummyInput().appendField("Пауза (мс)").appendField(new Blockly.FieldNumber(1000), "MS");
            this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(65);
        }
    };
    jsg.forBlock['esp32_delay'] = function(block) {
        return `delay(${block.getFieldValue('MS')});\n`;
    };

    // Serial Print
    Blockly.Blocks['esp32_serial_print'] = {
        init: function() {
            this.appendValueInput("TXT").appendField("Serial Печать");
            this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(160);
        }
    };
    jsg.forBlock['esp32_serial_print'] = function(block, generator) {
        const txt = generator.valueToCode(block, 'TXT', 0) || '""';
        return `Serial.println(${txt});\n`;
    };
}
