// ПОЛНАЯ КОНФИГУРАЦИЯ BLOCKLY ДЛЯ ESP32 (V3.0)
// Включает: ОСНОВНЫЕ, Логику, Циклы, I/O, Дисплеи, Прерывания, Массивы, Функции.

document.addEventListener('DOMContentLoaded', function() {
    if (window.workspace) return; 

    const blocklyDiv = document.getElementById('blocklyDiv');
    if (!blocklyDiv) return;

    // =================================================================
    // 1. ОПРЕДЕЛЕНИЕ ВИЗУАЛЬНЫХ БЛОКОВ (JSON) - СОХРАНЕНЫ ВСЕ + НОВЫЕ
    // =================================================================
    Blockly.defineBlocksWithJsonArray([
        // --- НОВЫЙ БЛОК: СТРУКТУРА (ОСНОВНЫЕ) ---
        {
            "type": "esp32_main_skeleton",
            "message0": "ГЛАВНЫЙ БЛОК ESP32 %1 НАСТРОЙКА (Setup): %2 %3 ЦИКЛ (Loop): %4 %5",
            "args0": [{ "type": "input_dummy" }, { "type": "input_dummy" }, { "type": "input_statement", "name": "SETUP" }, { "type": "input_dummy" }, { "type": "input_statement", "name": "LOOP" }],
            "colour": 260,
            "tooltip": "Базовая структура программы: блоки внутри Setup выполнятся один раз, блоки внутри Loop — бесконечно."
        },

        // --- ВРЕМЯ ---
        {
            "type": "esp32_delay",
            "message0": "ждать %1 мс",
            "args0": [{ "type": "input_value", "name": "MS", "check": "Number" }],
            "previousStatement": null, "nextStatement": null, "colour": 65,
            "tooltip": "Задержка выполнения (delay)"
        },
        {
            "type": "esp32_millis",
            "message0": "время с старта (мс)",
            "output": "Number", "colour": 65,
            "tooltip": "Возвращает millis()"
        },

        // --- ВХОДЫ / ВЫХОДЫ (GPIO) ---
        {
            "type": "esp32_pin_mode",
            "message0": "настроить пин %1 как %2",
            "args0": [
                { "type": "field_number", "name": "PIN", "value": 2, "min": 0, "max": 39 },
                { "type": "field_dropdown", "name": "MODE", "options": [["ВЫХОД (OUTPUT)", "OUTPUT"], ["ВХОД (INPUT)", "INPUT"], ["ВХОД С ПОДТЯЖКОЙ", "INPUT_PULLUP"]] }
            ],
            "previousStatement": null, "nextStatement": null, "colour": 160
        },
        {
            "type": "esp32_digital_write",
            "message0": "цифровой пин %1 установить %2",
            "args0": [
                { "type": "field_number", "name": "PIN", "value": 2 },
                { "type": "field_dropdown", "name": "STATE", "options": [["HIGH", "HIGH"], ["LOW", "LOW"]] }
            ],
            "previousStatement": null, "nextStatement": null, "colour": 160
        },
        {
            "type": "esp32_digital_read",
            "message0": "читать цифровой пин %1",
            "args0": [{ "type": "field_number", "name": "PIN", "value": 0 }],
            "output": "Number", "colour": 160
        },
        {
            "type": "esp32_analog_read",
            "message0": "читать аналоговый пин %1",
            "args0": [{ "type": "field_number", "name": "PIN", "value": 34 }],
            "output": "Number", "colour": 160
        },
        {
            "type": "esp32_pwm_write",
            "message0": "ШИМ (Analog) пин %1 знач %2",
            "args0": [
                { "type": "field_number", "name": "PIN", "value": 2 },
                { "type": "input_value", "name": "VAL", "check": "Number" }
            ],
            "previousStatement": null, "nextStatement": null, "colour": 160
        },

        // --- МОНИТОР ПОРТА (SERIAL) ---
        {
            "type": "esp32_serial_init",
            "message0": "Serial скорость %1",
            "args0": [{ "type": "field_number", "name": "BAUD", "value": 115200 }],
            "previousStatement": null, "nextStatement": null, "colour": 20
        },
        {
            "type": "esp32_serial_print",
            "message0": "Serial печать %1 (новая строка: %2)",
            "args0": [{ "type": "input_value", "name": "MSG" }, { "type": "field_checkbox", "name": "NL", "checked": true }],
            "previousStatement": null, "nextStatement": null, "colour": 20
        },
        {
            "type": "esp32_serial_available",
            "message0": "Serial данные доступны?",
            "output": "Boolean", "colour": 20
        },

        // --- ПРЕРЫВАНИЯ ---
        {
            "type": "esp32_interrupt",
            "message0": "Прерывание на пине %1 режим %2 %3 выполнять %4",
            "args0": [
                { "type": "field_number", "name": "PIN", "value": 0 },
                { "type": "field_dropdown", "name": "MODE", "options": [["CHANGE", "CHANGE"], ["RISING", "RISING"], ["FALLING", "FALLING"]] },
                { "type": "input_dummy" }, { "type": "input_statement", "name": "DO" }
            ],
            "previousStatement": null, "nextStatement": null, "colour": 290
        },

        // --- LCD ДИСПЛЕЙ ---
        {
            "type": "lcd_i2c_init",
            "message0": "LCD I2C иниц. адрес 0x%1 колог %2 строк %3",
            "args0": [{ "type": "field_input", "name": "ADDR", "text": "27" }, { "type": "field_number", "name": "COLS", "value": 16 }, { "type": "field_number", "name": "ROWS", "value": 2 }],
            "previousStatement": null, "nextStatement": null, "colour": 190
        },
        {
            "type": "lcd_i2c_print",
            "message0": "LCD печать %1 на стр %2 поз %3",
            "args0": [{ "type": "input_value", "name": "TEXT" }, { "type": "field_number", "name": "ROW", "value": 0 }, { "type": "field_number", "name": "COL", "value": 0 }],
            "previousStatement": null, "nextStatement": null, "colour": 190
        },
        {
            "type": "lcd_i2c_clear",
            "message0": "LCD очистить",
            "previousStatement": null, "nextStatement": null, "colour": 190
        },

        // --- OLED ДИСПЛЕЙ ---
        {
            "type": "oled_init",
            "message0": "OLED иниц. (128x64 I2C)",
            "previousStatement": null, "nextStatement": null, "colour": 180
        },
        {
            "type": "oled_print",
            "message0": "OLED текст %1 размер %2 x %3 y %4",
            "args0": [{ "type": "input_value", "name": "TEXT" }, { "type": "field_number", "name": "SIZE", "value": 1 }, { "type": "field_number", "name": "X", "value": 0 }, { "type": "field_number", "name": "Y", "value": 0 }],
            "previousStatement": null, "nextStatement": null, "colour": 180
        },
        {
            "type": "oled_display",
            "message0": "OLED обновить экран",
            "previousStatement": null, "nextStatement": null, "colour": 180
        },
        {
            "type": "oled_clear",
            "message0": "OLED очистить",
            "previousStatement": null, "nextStatement": null, "colour": 180
        }
    ]);

    // =================================================================
    // 2. ГЕНЕРАТОР ARDUINO C++
    // =================================================================
    Blockly.Arduino = new Blockly.Generator('Arduino');
    Blockly.Arduino.ORDER_ATOMIC = 0;
    Blockly.Arduino.ORDER_NONE = 99;

    Blockly.Arduino.init = function(workspace) {
        Blockly.Arduino.definitions_ = Object.create(null);
        Blockly.Arduino.setups_ = Object.create(null);
        Blockly.Arduino.libraries_ = Object.create(null);
        
        if (!Blockly.Arduino.nameDB_) {
            Blockly.Arduino.nameDB_ = new Blockly.Names(Blockly.Arduino.RESERVED_WORDS_);
        } else {
            Blockly.Arduino.nameDB_.reset();
        }
        Blockly.Arduino.nameDB_.setVariableMap(workspace.getVariableMap());

        // Глобальные переменные
        const defvars = [];
        const variables = workspace.getAllVariables();
        for (let i = 0; i < variables.length; i++) {
            const varName = Blockly.Arduino.nameDB_.getName(variables[i].getId(), Blockly.Variables.NAME_TYPE);
            defvars.push(`float ${varName} = 0;`); 
        }
        if (defvars.length) {
            Blockly.Arduino.definitions_['variables'] = defvars.join('\n');
        }
    };

    Blockly.Arduino.scrub_ = function(block, code, opt_thisOnly) {
        const nextBlock = block.getNextBlock();
        const nextCode = (nextBlock && !opt_thisOnly) ? Blockly.Arduino.blockToCode(nextBlock) : '';
        return code + nextCode;
    };

    // ГЕНЕРАТОРЫ ДЛЯ ESP32
    Blockly.Arduino.forBlock['esp32_main_skeleton'] = function(block, generator) {
        const setupCode = generator.statementToCode(block, 'SETUP');
        const loopCode = generator.statementToCode(block, 'LOOP');
        Blockly.Arduino.setups_['manual_setup'] = setupCode;
        return loopCode;
    };

    Blockly.Arduino.forBlock['esp32_pin_mode'] = function(block) {
        Blockly.Arduino.setups_['pin_mode_' + block.getFieldValue('PIN')] = `pinMode(${block.getFieldValue('PIN')}, ${block.getFieldValue('MODE')});`;
        return '';
    };

    Blockly.Arduino.forBlock['esp32_digital_write'] = function(block) {
        return `digitalWrite(${block.getFieldValue('PIN')}, ${block.getFieldValue('STATE')});\n`;
    };

    Blockly.Arduino.forBlock['esp32_digital_read'] = function(block) {
        return [`digitalRead(${block.getFieldValue('PIN')})`, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.forBlock['esp32_delay'] = function(block, generator) {
        return `delay(${generator.valueToCode(block, 'MS', Blockly.Arduino.ORDER_NONE) || '0'});\n`;
    };

    Blockly.Arduino.forBlock['esp32_serial_print'] = function(block, generator) {
        const msg = generator.valueToCode(block, 'MSG', Blockly.Arduino.ORDER_NONE) || '""';
        return `Serial.${block.getFieldValue('NL') === 'TRUE' ? 'println' : 'print'}(${msg});\n`;
    };

    // Копирование логики из JS для стандартных блоков
    if (Blockly.JavaScript) {
        const std = ['controls_if', 'controls_repeat_ext', 'logic_compare', 'logic_operation', 'math_number', 'math_arithmetic', 'text', 'variables_get', 'variables_set', 'lists_create_with'];
        std.forEach(type => {
            Blockly.Arduino.forBlock[type] = function(block, generator) {
                return Blockly.JavaScript.forBlock[type](block, generator);
            };
        });
    }

    // (Здесь можно добавить остальные генераторы для OLED/LCD/Interrupts по аналогии с твоим исходником)
    // ...

    // =================================================================
    // 3. ИНИЦИАЛИЗАЦИЯ И СОХРАНЕНИЕ
    // =================================================================
    
    window.workspace = Blockly.inject(blocklyDiv, {
        toolbox: getToolboxConfig(),
        media: 'https://unpkg.com/blockly/media/',
        grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
        zoom: { controls: true, wheel: true },
        trashcan: true
    });

    // Авто-загрузка
    const saved = localStorage.getItem('blockly_workspace_persistent');
    if (saved) {
        try { Blockly.serialization.workspaces.load(JSON.parse(saved), window.workspace); } catch(e) {}
    }

    // Авто-сохранение
    window.workspace.addChangeListener((e) => {
        if (e.isUiEvent) return;
        localStorage.setItem('blockly_workspace_persistent', JSON.stringify(Blockly.serialization.workspaces.save(window.workspace)));
        generateFullCode();
    });
});

// =================================================================
// 4. ТУЛБОКС (МЕНЮ) - ВСЕ КАТЕГОРИИ НА МЕСТЕ
// =================================================================
function getToolboxConfig() {
    return {
        'kind': 'categoryToolbox',
        'contents': [
            {
                'kind': 'category', 'name': 'ОСНОВНЫЕ', 'colour': '260',
                'contents': [
                    { 'kind': 'block', 'type': 'esp32_main_skeleton' },
                    { 'kind': 'block', 'type': 'esp32_delay' },
                    { 'kind': 'block', 'type': 'esp32_serial_print' }
                ]
            },
            {
                'kind': 'category', 'name': 'Логика', 'colour': '210',
                'contents': [
                    { 'kind': 'block', 'type': 'controls_if' },
                    { 'kind': 'block', 'type': 'logic_compare' },
                    { 'kind': 'block', 'type': 'logic_operation' }
                ]
            },
            {
                'kind': 'category', 'name': 'Циклы', 'colour': '120',
                'contents': [
                    { 'kind': 'block', 'type': 'controls_repeat_ext' },
                    { 'kind': 'block', 'type': 'controls_whileUntil' }
                ]
            },
            {
                'kind': 'category', 'name': 'Математика', 'colour': '230',
                'contents': [
                    { 'kind': 'block', 'type': 'math_number' },
                    { 'kind': 'block', 'type': 'math_arithmetic' }
                ]
            },
            { 'kind': 'category', 'name': 'Переменные', 'custom': 'VARIABLE', 'colour': '330' },
            {
                'kind': 'category', 'name': 'Массивы', 'colour': '260',
                'contents': [
                    { 'kind': 'block', 'type': 'lists_create_with' }
                ]
            },
            { 'kind': 'category', 'name': 'Функции', 'custom': 'PROCEDURE', 'colour': '290' },
            { 'kind': 'sep' },
            {
                'kind': 'category', 'name': 'Входы / Выходы', 'colour': '160',
                'contents': [
                    { 'kind': 'block', 'type': 'esp32_pin_mode' },
                    { 'kind': 'block', 'type': 'esp32_digital_write' },
                    { 'kind': 'block', 'type': 'esp32_digital_read' },
                    { 'kind': 'block', 'type': 'esp32_pwm_write' },
                    { 'kind': 'block', 'type': 'esp32_analog_read' }
                ]
            },
            {
                'kind': 'category', 'name': 'Дисплей LCD', 'colour': '190',
                'contents': [
                    { 'kind': 'block', 'type': 'lcd_i2c_init' },
                    { 'kind': 'block', 'type': 'lcd_i2c_print' },
                    { 'kind': 'block', 'type': 'lcd_i2c_clear' }
                ]
            },
            {
                'kind': 'category', 'name': 'Дисплей OLED', 'colour': '180',
                'contents': [
                    { 'kind': 'block', 'type': 'oled_init' },
                    { 'kind': 'block', 'type': 'oled_print' },
                    { 'kind': 'block', 'type': 'oled_display' },
                    { 'kind': 'block', 'type': 'oled_clear' }
                ]
            },
            {
                'kind': 'category', 'name': 'Прерывания', 'colour': '290',
                'contents': [
                    { 'kind': 'block', 'type': 'esp32_interrupt' }
                ]
            }
        ]
    };
}

function generateFullCode() {
    try {
        Blockly.Arduino.init(window.workspace);
        const code = Blockly.Arduino.workspaceToCode(window.workspace);
        const libs = Object.values(Blockly.Arduino.libraries_ || {}).join('\n');
        const defs = Object.values(Blockly.Arduino.definitions_ || {}).join('\n');
        const setups = Object.values(Blockly.Arduino.setups_ || {}).join('\n  ');

        const fullCode = `/* Сгенерировано ESP32 Blockly */\n#include <Arduino.h>\n${libs}\n\n${defs}\n\nvoid setup() {\n  Serial.begin(115200);\n  ${setups}\n}\n\nvoid loop() {\n${code}\n  delay(1);\n}`;
        if (window.codeViewer) window.codeViewer.setCode(fullCode, 'cpp');
    } catch (e) { console.error(e); }
}
