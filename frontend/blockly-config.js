/**
 * Конфигурация Blockly 12.3.1 для ESP32
 */

// 1. ЗАПЛАТКА: Предотвращаем ошибку повторной регистрации расширений
(function() {
    if (typeof Blockly !== 'undefined' && Blockly.Extensions) {
        const originalRegister = Blockly.Extensions.register;
        Blockly.Extensions.register = function(name, callback) {
            if (Blockly.Extensions.isRegistered(name)) {
                console.warn('Blockly: Расширение "' + name + '" уже было зарегистрировано. Пропускаем.');
                return;
            }
            return originalRegister.call(this, name, callback);
        };
    }
})();

document.addEventListener('DOMContentLoaded', function() {
    // Проверка на двойную инициализацию
    if (window.workspace) {
        console.warn('Blockly уже инициализирован');
        return;
    }
    
    const blocklyDiv = document.getElementById('blocklyDiv');
    if (!blocklyDiv) {
        console.error('Элемент blocklyDiv не найден');
        return;
    }
    
    try {
        // Инициализация рабочей области
        window.workspace = Blockly.inject(blocklyDiv, {
            toolbox: getToolboxConfig(),
            zoom: {
                controls: true,
                wheel: true,
                startScale: 1.0,
                maxScale: 3,
                minScale: 0.3,
                scaleSpeed: 1.2
            },
            trashcan: true,
            media: 'https://unpkg.com/blockly/media/',
            scrollbars: true,
            move: {
                scrollbars: true,
                drag: true,
                wheel: false
            }
        });
        
        console.log('Blockly успешно инициализирован');
        
        // Создаем кастомные блоки
        createCustomBlocks();
        
        // Автоматическая генерация кода при изменениях
        window.workspace.addChangeListener(function(event) {
            if (!event.isUiEvent) {
                // Небольшая задержка, чтобы не нагружать браузер
                if (window.genTimer) clearTimeout(window.genTimer);
                window.genTimer = setTimeout(generateCode, 200);
            }
        });
        
    } catch (error) {
        console.error('Ошибка инициализации Blockly:', error);
    }
});

// Конфигурация Toolbox
function getToolboxConfig() {
    return {
        kind: 'categoryToolbox',
        contents: [
            { kind: 'category', name: 'Логика', colour: '#5C81A6', contents: [
                { kind: 'block', type: 'controls_if' },
                { kind: 'block', type: 'logic_compare' },
                { kind: 'block', type: 'logic_operation' },
                { kind: 'block', type: 'logic_boolean' }
            ]},
            { kind: 'category', name: 'Циклы', colour: '#5CA65C', contents: [
                { kind: 'block', type: 'controls_whileUntil' },
                { kind: 'block', type: 'controls_for' },
                { kind: 'block', type: 'controls_repeat' }
            ]},
            { kind: 'category', name: 'Математика', colour: '#A65C81', contents: [
                { kind: 'block', type: 'math_number' },
                { kind: 'block', type: 'math_arithmetic' }
            ]},
            { kind: 'category', name: 'Переменные', colour: '#FF8C1A', custom: 'VARIABLE' },
            { kind: 'category', name: 'Функции', colour: '#995BA5', custom: 'PROCEDURE' },
            { kind: 'sep' },
            { kind: 'category', name: 'ESP32 GPIO', colour: '#4A90E2', contents: [
                { kind: 'block', type: 'esp32_pin_mode' },
                { kind: 'block', type: 'esp32_digital_write' },
                { kind: 'block', type: 'esp32_digital_read' }
            ]},
            { kind: 'category', name: 'Время и Serial', colour: '#FF6347', contents: [
                { kind: 'block', type: 'esp32_delay' },
                { kind: 'block', type: 'esp32_serial_begin' },
                { kind: 'block', type: 'esp32_serial_print' }
            ]}
        ]
    };
}

// Кастомные блоки
function createCustomBlocks() {
    if (window.blocksCreated) return;
    window.blocksCreated = true;

    // Массив пинов ESP32
    const esp32_pins = [
        ["2 (LED)", "2"], ["4", "4"], ["5", "5"], ["12", "12"], ["13", "13"],
        ["14", "14"], ["15", "15"], ["16", "16"], ["17", "17"], ["18", "18"],
        ["19", "19"], ["21", "21"], ["22", "22"], ["23", "23"], ["25", "25"],
        ["26", "26"], ["27", "27"], ["32", "32"], ["33", "33"]
    ];

    Blockly.Blocks['esp32_pin_mode'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Настроить пин")
                .appendField(new Blockly.FieldDropdown(esp32_pins), "PIN")
                .appendField("как")
                .appendField(new Blockly.FieldDropdown([["ВЫХОД", "OUTPUT"], ["ВХОД", "INPUT"], ["PULLUP", "INPUT_PULLUP"]]), "MODE");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(230);
        }
    };

    Blockly.Blocks['esp32_digital_write'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Установить пин")
                .appendField(new Blockly.FieldDropdown(esp32_pins), "PIN")
                .appendField("в")
                .appendField(new Blockly.FieldDropdown([["ВЫСОКИЙ (1)", "HIGH"], ["НИЗКИЙ (0)", "LOW"]]), "STATE");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(230);
        }
    };

    Blockly.Blocks['esp32_digital_read'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Считать пин")
                .appendField(new Blockly.FieldDropdown(esp32_pins), "PIN");
            this.setOutput(true, "Boolean");
            this.setColour(230);
        }
    };

    Blockly.Blocks['esp32_delay'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Пауза")
                .appendField(new Blockly.FieldNumber(1000, 0), "TIME")
                .appendField("мс");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(160);
        }
    };

    Blockly.Blocks['esp32_serial_begin'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Serial начать")
                .appendField(new Blockly.FieldDropdown([["115200", "115200"], ["9600", "9600"]]), "BAUD");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(300);
        }
    };

    Blockly.Blocks['esp32_serial_print'] = {
        init: function() {
            this.appendValueInput("TEXT").setCheck(null).appendField("Serial печать");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(300);
        }
    };
}

// 2. Инициализация генератора C++
Blockly.Cpp = new Blockly.Generator('C++');
Blockly.Cpp.ORDER_ATOMIC = 0;
Blockly.Cpp.ORDER_NONE = 99;

// Правила генерации
Blockly.Cpp['esp32_pin_mode'] = function(block) {
    return `pinMode(${block.getFieldValue('PIN')}, ${block.getFieldValue('MODE')});\n`;
};

Blockly.Cpp['esp32_digital_write'] = function(block) {
    return `digitalWrite(${block.getFieldValue('PIN')}, ${block.getFieldValue('STATE')});\n`;
};

Blockly.Cpp['esp32_digital_read'] = function(block) {
    return [`digitalRead(${block.getFieldValue('PIN')})`, Blockly.Cpp.ORDER_ATOMIC];
};

Blockly.Cpp['esp32_delay'] = function(block) {
    return `delay(${block.getFieldValue('TIME')});\n`;
};

Blockly.Cpp['esp32_serial_begin'] = function(block) {
    return `Serial.begin(${block.getFieldValue('BAUD')});\n`;
};

Blockly.Cpp['esp32_serial_print'] = function(block) {
    const val = Blockly.Cpp.valueToCode(block, 'TEXT', Blockly.Cpp.ORDER_ATOMIC) || '" "';
    return `Serial.println(${val});\n`;
};

Blockly.Cpp['math_number'] = function(block) {
    return [block.getFieldValue('NUM'), Blockly.Cpp.ORDER_ATOMIC];
};

// Функция генерации полного кода
function generateCode() {
    if (!window.workspace) return;
    
    try {
        const topBlocks = window.workspace.getTopBlocks(false);
        let setupCode = '';
        let loopCode = '';
        
        topBlocks.forEach(block => {
            const code = Blockly.Cpp.blockToCode(block);
            if (block.type === 'esp32_pin_mode' || block.type === 'esp32_serial_begin') {
                setupCode += code;
            } else {
                loopCode += code;
            }
        });
        
        const finalCode = `// ESP32 Generated Code\n\nvoid setup() {\n  ${setupCode.replace(/\n/g, '\n  ')}\n}\n\nvoid loop() {\n  ${loopCode.replace(/\n/g, '\n  ')}\n}`;
        
        // Отправка в редактор (code-viewer.js)
        if (window.codeViewer && typeof window.codeViewer.setCode === 'function') {
            window.codeViewer.setCode(finalCode, 'cpp');
        } else {
            const editorDiv = document.getElementById('codeEditor');
            if (editorDiv) editorDiv.innerText = finalCode;
        }

        return finalCode;
    } catch (e) {
        console.error("Ошибка генерации:", e);
    }
}
