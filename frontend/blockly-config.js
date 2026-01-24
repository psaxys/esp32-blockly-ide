// Конфигурация Blockly 12.3.1 без конфликтов
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, не был ли Blockly уже инициализирован
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
        // Создаем рабочую область с более простой конфигурацией
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
            horizontalLayout: false,
            toolboxPosition: 'start',
            css: true,
            media: 'https://unpkg.com/blockly/media/',
            rtl: false,
            scrollbars: true,
            sounds: true,
            oneBasedIndex: true,
            collapse: true,
            comments: false, // Отключаем комментарии для уменьшения конфликтов
            disable: false,
            maxBlocks: Infinity,
            maxInstances: {
                'math_number': Infinity,
                'text': Infinity
            }
        });
        
        console.log('Blockly успешно инициализирован');
        
        // Создаем кастомные блоки
        createCustomBlocks();
        
        // Обновляем код при изменении блоков
        window.workspace.addChangeListener(function(event) {
            if (!event.isUiEvent) {
                setTimeout(generateCode, 100);
            }
        });
        
    } catch (error) {
        console.error('Ошибка инициализации Blockly:', error);
    }
});

// Упрощенная конфигурация Toolbox
function getToolboxConfig() {
    return {
        kind: 'categoryToolbox',
        contents: [
            {
                kind: 'category',
                name: 'Логика',
                colour: '#5C81A6',
                contents: [
                    { kind: 'block', type: 'controls_if' },
                    { kind: 'block', type: 'logic_compare' },
                    { kind: 'block', type: 'logic_operation' },
                    { kind: 'block', type: 'logic_boolean' }
                ]
            },
            {
                kind: 'category',
                name: 'Циклы',
                colour: '#5CA65C',
                contents: [
                    { kind: 'block', type: 'controls_whileUntil' },
                    { kind: 'block', type: 'controls_for' },
                    { kind: 'block', type: 'controls_repeat' }
                ]
            },
            {
                kind: 'category',
                name: 'Математика',
                colour: '#A65C81',
                contents: [
                    { kind: 'block', type: 'math_number' },
                    { kind: 'block', type: 'math_arithmetic' },
                    { kind: 'block', type: 'math_single' }
                ]
            },
            {
                kind: 'category',
                name: 'Текст',
                colour: '#A6A65C',
                contents: [
                    { kind: 'block', type: 'text' },
                    { kind: 'block', type: 'text_join' }
                ]
            },
            {
                kind: 'category',
                name: 'Переменные',
                colour: '#FF8C1A',
                custom: 'VARIABLE'
            },
            {
                kind: 'category',
                name: 'Функции',
                colour: '#995BA5',
                custom: 'PROCEDURE'
            },
            {
                kind: 'category',
                name: 'ESP32 GPIO',
                colour: '#4A90E2',
                contents: [
                    {
                        kind: 'block',
                        type: 'esp32_pin_mode'
                    },
                    {
                        kind: 'block',
                        type: 'esp32_digital_write'
                    },
                    {
                        kind: 'block',
                        type: 'esp32_digital_read'
                    }
                ]
            },
            {
                kind: 'category',
                name: 'Время',
                colour: '#20B2AA',
                contents: [
                    { kind: 'block', type: 'esp32_delay' }
                ]
            },
            {
                kind: 'category',
                name: 'Serial',
                colour: '#FF6347',
                contents: [
                    { kind: 'block', type: 'esp32_serial_begin' },
                    { kind: 'block', type: 'esp32_serial_print' }
                ]
            }
        ]
    };
}

// Создаем кастомные блоки с уникальными именами
function createCustomBlocks() {
    // Проверяем, не были ли блоки уже созданы
    if (window.blocksCreated) {
        return;
    }
    window.blocksCreated = true;
    
    // Блок для настройки пина ESP32
    Blockly.Blocks['esp32_pin_mode'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Настроить пин")
                .appendField(new Blockly.FieldDropdown([
                    ["2", "2"], ["4", "4"], ["5", "5"], ["12", "12"],
                    ["13", "13"], ["14", "14"], ["15", "15"], ["16", "16"],
                    ["17", "17"], ["18", "18"], ["19", "19"], ["21", "21"],
                    ["22", "22"], ["23", "23"], ["25", "25"], ["26", "26"],
                    ["27", "27"], ["32", "32"], ["33", "33"]
                ]), "PIN")
                .appendField("как")
                .appendField(new Blockly.FieldDropdown([
                    ["Выход (OUTPUT)", "OUTPUT"],
                    ["Вход (INPUT)", "INPUT"],
                    ["Вход с подтяжкой (INPUT_PULLUP)", "INPUT_PULLUP"]
                ]), "MODE");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(230);
            this.setTooltip("Настройка режима работы пина ESP32");
            this.setHelpUrl("");
        }
    };

    // Блок для записи в цифровой пин ESP32
    Blockly.Blocks['esp32_digital_write'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Установить пин")
                .appendField(new Blockly.FieldDropdown([
                    ["2", "2"], ["4", "4"], ["5", "5"], ["12", "12"],
                    ["13", "13"], ["14", "14"], ["15", "15"], ["16", "16"],
                    ["17", "17"], ["18", "18"], ["19", "19"], ["21", "21"],
                    ["22", "22"], ["23", "23"], ["25", "25"], ["26", "26"],
                    ["27", "27"], ["32", "32"], ["33", "33"]
                ]), "PIN")
                .appendField("в")
                .appendField(new Blockly.FieldDropdown([
                    ["HIGH (ВКЛ)", "HIGH"],
                    ["LOW (ВЫКЛ)", "LOW"]
                ]), "STATE");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(230);
            this.setTooltip("Установка HIGH или LOW на цифровом пине ESP32");
            this.setHelpUrl("");
        }
    };

    // Блок для чтения цифрового пина ESP32
    Blockly.Blocks['esp32_digital_read'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Прочитать пин")
                .appendField(new Blockly.FieldDropdown([
                    ["2", "2"], ["4", "4"], ["5", "5"], ["12", "12"],
                    ["13", "13"], ["14", "14"], ["15", "15"], ["16", "16"],
                    ["17", "17"], ["18", "18"], ["19", "19"], ["21", "21"],
                    ["22", "22"], ["23", "23"], ["25", "25"], ["26", "26"],
                    ["27", "27"], ["32", "32"], ["33", "33"]
                ]), "PIN");
            this.setOutput(true, 'Boolean');
            this.setColour(230);
            this.setTooltip("Чтение состояния цифрового пина ESP32 (HIGH/LOW)");
            this.setHelpUrl("");
        }
    };

    // Блок для задержки ESP32
    Blockly.Blocks['esp32_delay'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Задержка")
                .appendField(new Blockly.FieldNumber(1000, 0, 60000, 1), "TIME")
                .appendField("мс");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(160);
            this.setTooltip("Задержка в миллисекундах для ESP32");
            this.setHelpUrl("");
        }
    };

    // Блок для Serial.begin ESP32
    Blockly.Blocks['esp32_serial_begin'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Serial начать")
                .appendField(new Blockly.FieldDropdown([
                    ["9600", "9600"],
                    ["115200", "115200"],
                    ["921600", "921600"]
                ]), "BAUD");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(300);
            this.setTooltip("Инициализация Serial порта на ESP32");
            this.setHelpUrl("");
        }
    };

    // Блок для Serial.print ESP32
    Blockly.Blocks['esp32_serial_print'] = {
        init: function() {
            this.appendValueInput("TEXT")
                .setCheck(["String", "Number", "Boolean"])
                .appendField("Serial напечатать");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(300);
            this.setTooltip("Отправка данных в Serial порт ESP32");
            this.setHelpUrl("");
        }
    };
}

// Генератор кода для ESP32 (C++)
Blockly.Cpp = new Blockly.Generator('C++');

// Определение генераторов для каждого кастомного блока
Blockly.Cpp['esp32_pin_mode'] = function(block) {
    const pin = block.getFieldValue('PIN');
    const mode = block.getFieldValue('MODE');
    return `pinMode(${pin}, ${mode});\n`;
};

Blockly.Cpp['esp32_digital_write'] = function(block) {
    const pin = block.getFieldValue('PIN');
    const state = block.getFieldValue('STATE');
    return `digitalWrite(${pin}, ${state});\n`;
};

Blockly.Cpp['esp32_digital_read'] = function(block) {
    const pin = block.getFieldValue('PIN');
    return [`digitalRead(${pin})`, Blockly.Cpp.ORDER_ATOMIC];
};

Blockly.Cpp['esp32_delay'] = function(block) {
    const time = block.getFieldValue('TIME');
    return `delay(${time});\n`;
};

Blockly.Cpp['esp32_serial_begin'] = function(block) {
    const baud = block.getFieldValue('BAUD');
    return `Serial.begin(${baud});\n`;
};

Blockly.Cpp['esp32_serial_print'] = function(block) {
    const text = Blockly.Cpp.valueToCode(block, 'TEXT', Blockly.Cpp.ORDER_ATOMIC) || '""';
    return `Serial.print(${text});\n`;
};

// Стандартные блоки
Blockly.Cpp['math_number'] = function(block) {
    const number = block.getFieldValue('NUM');
    return [number, Blockly.Cpp.ORDER_ATOMIC];
};

Blockly.Cpp['text'] = function(block) {
    const text = block.getFieldValue('TEXT');
    return ['"' + text + '"', Blockly.Cpp.ORDER_ATOMIC];
};

Blockly.Cpp['logic_boolean'] = function(block) {
    const bool = block.getFieldValue('BOOL') === 'TRUE';
    return [bool ? 'true' : 'false', Blockly.Cpp.ORDER_ATOMIC];
};

// Генерация кода
function generateCode() {
    try {
        if (!window.workspace) {
            console.error('Рабочая область Blockly не инициализирована');
            return '// Рабочая область не инициализирована\n';
        }
        
        const allBlocks = window.workspace.getTopBlocks(false);
        let setupCode = '';
        let loopCode = '';
        
        for (const block of allBlocks) {
            const code = Blockly.Cpp.blockToCode(block);
            if (code) {
                // Простая эвристика: если блок не в цикле/условии, идет в setup
                if (block.type === 'esp32_pin_mode' || block.type === 'esp32_serial_begin') {
                    setupCode += code;
                } else {
                    loopCode += code;
                }
            }
        }
        
        const fullCode = `// Функция настройки блоков
void setup_blocks() {
${setupCode ? '    ' + setupCode.trim().replace(/\n/g, '\n    ') : '    // Нет блоков для setup'}
}

// Функция выполнения блоков
void loop_blocks() {
${loopCode ? '    ' + loopCode.trim().replace(/\n/g, '\n    ') : '    // Нет блоков для loop'}
}`;
        
        // Обновляем редактор кода
        if (window.codeViewer) {
            window.codeViewer.setCode(fullCode, 'cpp');
        }
        
        updateStatus('Код успешно сгенерирован', 'success');
        return fullCode;
    } catch (error) {
        console.error('Ошибка генерации кода:', error);
        updateStatus('Ошибка генерации кода: ' + error.message, 'error');
        return '// Ошибка генерации кода\n';
    }
}

// Обновление статуса (вспомогательная функция)
function updateStatus(message, type = 'info') {
    console.log(`${type}: ${message}`);
    // Здесь можно добавить обновление UI статуса
}
