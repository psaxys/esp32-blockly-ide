// ПОЛНАЯ КОНФИГУРАЦИЯ ESP32 BLOCKLY (Версия 3.2 - Исправленная)

document.addEventListener('DOMContentLoaded', function() {
    if (window.workspace) return; 

    const blocklyDiv = document.getElementById('blocklyDiv');
    if (!blocklyDiv) return;

    // =================================================================
    // 1. ОПРЕДЕЛЕНИЕ БЛОКОВ (JSON)
    // =================================================================
    Blockly.defineBlocksWithJsonArray([
        {
            "type": "esp32_main_skeleton",
            "message0": "ГЛАВНЫЙ БЛОК ESP32 %1 НАСТРОЙКА (Setup): %2 %3 ЦИКЛ (Loop): %4 %5",
            "args0": [{ "type": "input_dummy" }, { "type": "input_dummy" }, { "type": "input_statement", "name": "SETUP" }, { "type": "input_dummy" }, { "type": "input_statement", "name": "LOOP" }],
            "colour": 260
        },
        {
            "type": "esp32_delay",
            "message0": "ждать %1 мс",
            "args0": [{ "type": "input_value", "name": "MS", "check": "Number" }],
            "previousStatement": null, "nextStatement": null, "colour": 65
        },
        {
            "type": "esp32_pin_mode",
            "message0": "настроить пин %1 как %2",
            "args0": [
                { "type": "field_number", "name": "PIN", "value": 2 },
                { "type": "field_dropdown", "name": "MODE", "options": [["ВЫХОД", "OUTPUT"], ["ВХОД", "INPUT"], ["PULLUP", "INPUT_PULLUP"]] }
            ],
            "previousStatement": null, "nextStatement": null, "colour": 160
        },
        {
            "type": "esp32_digital_write",
            "message0": "пин %1 установить %2",
            "args0": [
                { "type": "field_number", "name": "PIN", "value": 2 },
                { "type": "field_dropdown", "name": "STATE", "options": [["HIGH", "HIGH"], ["LOW", "LOW"]] }
            ],
            "previousStatement": null, "nextStatement": null, "colour": 160
        },
        {
            "type": "esp32_serial_print",
            "message0": "Serial печать %1 (LN: %2)",
            "args0": [{ "type": "input_value", "name": "MSG" }, { "type": "field_checkbox", "name": "NL", "checked": true }],
            "previousStatement": null, "nextStatement": null, "colour": 20
        },
        {
            "type": "lcd_i2c_init",
            "message0": "LCD I2C иниц.",
            "previousStatement": null, "nextStatement": null, "colour": 190
        },
        {
            "type": "oled_init",
            "message0": "OLED иниц.",
            "previousStatement": null, "nextStatement": null, "colour": 180
        }
    ]);

    // =================================================================
    // 2. ГЕНЕРАТОР ARDUINO (C++)
    // =================================================================
    Blockly.Arduino = new Blockly.Generator('Arduino');
    Blockly.Arduino.ORDER_ATOMIC = 0;
    Blockly.Arduino.ORDER_NONE = 99;

    Blockly.Arduino.init = function(workspace) {
        Blockly.Arduino.definitions_ = Object.create(null);
        Blockly.Arduino.setups_ = Object.create(null);
        
        if (!Blockly.Arduino.nameDB_) {
            Blockly.Arduino.nameDB_ = new Blockly.Names(Blockly.Arduino.RESERVED_WORDS_);
        } else {
            Blockly.Arduino.nameDB_.reset();
        }
        
        // ИСПРАВЛЕНИЕ: Используем getVariableMap() для совместимости с v12/v13
        Blockly.Arduino.nameDB_.setVariableMap(workspace.getVariableMap());

        const defvars = [];
        const variables = workspace.getVariableMap().getAllVariables();
        for (let i = 0; i < variables.length; i++) {
            const varName = Blockly.Arduino.nameDB_.getName(variables[i].getId(), Blockly.Variables.NAME_TYPE);
            defvars.push(`float ${varName} = 0;`); 
        }
        Blockly.Arduino.definitions_['variables'] = defvars.join('\n');
    };

    // --- ГЕНЕРАТОРЫ БЛОКОВ ---
    
    Blockly.Arduino.forBlock['esp32_main_skeleton'] = function(block, generator) {
        const setupCode = generator.statementToCode(block, 'SETUP');
        const loopCode = generator.statementToCode(block, 'LOOP');
        Blockly.Arduino.setups_['manual_setup'] = setupCode;
        return loopCode;
    };

    // ТЕПЕРЬ ГЕНЕРАТОР ЗНАЕТ ПРО PIN_MODE
    Blockly.Arduino.forBlock['esp32_pin_mode'] = function(block) {
        const pin = block.getFieldValue('PIN');
        const mode = block.getFieldValue('MODE');
        return `pinMode(${pin}, ${mode});\n`;
    };

    Blockly.Arduino.forBlock['esp32_digital_write'] = function(block) {
        const pin = block.getFieldValue('PIN');
        const state = block.getFieldValue('STATE');
        return `digitalWrite(${pin}, ${state});\n`;
    };

    Blockly.Arduino.forBlock['esp32_delay'] = function(block, generator) {
        const ms = generator.valueToCode(block, 'MS', Blockly.Arduino.ORDER_NONE) || '0';
        return `delay(${ms});\n`;
    };

    Blockly.Arduino.forBlock['esp32_serial_print'] = function(block, generator) {
        const msg = generator.valueToCode(block, 'MSG', Blockly.Arduino.ORDER_NONE) || '""';
        const func = block.getFieldValue('NL') === 'TRUE' ? 'println' : 'print';
        return `Serial.${func}(${msg});\n`;
    };

    // Дисплеи (пустые заглушки для примера)
    Blockly.Arduino.forBlock['lcd_i2c_init'] = function() { return 'lcd.init();\nlcd.backlight();\n'; };
    Blockly.Arduino.forBlock['oled_init'] = function() { return 'display.begin(SSD1306_SWITCHCAPVCC, 0x3C);\n'; };

    // Стандартные блоки (Логика, Математика, Переменные)
    const stdBlocks = ['controls_if', 'logic_compare', 'math_number', 'variables_get', 'variables_set', 'math_change', 'lists_create_with'];
    stdBlocks.forEach(type => {
        Blockly.Arduino.forBlock[type] = function(block, generator) {
            if (Blockly.JavaScript && Blockly.JavaScript.forBlock[type]) {
                return Blockly.JavaScript.forBlock[type](block, generator);
            }
            return ''; 
        };
    });

    Blockly.Arduino.scrub_ = function(block, code, opt_thisOnly) {
        const nextBlock = block.getNextBlock();
        const nextCode = (nextBlock && !opt_thisOnly) ? Blockly.Arduino.blockToCode(nextBlock) : '';
        return code + nextCode;
    };

    // =================================================================
    // 3. ЗАПУСК
    // =================================================================
    window.workspace = Blockly.inject(blocklyDiv, {
        toolbox: getToolboxConfig(),
        media: 'https://unpkg.com/blockly/media/',
        grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
        trashcan: true
    });

    window.workspace.addChangeListener((e) => {
        if (e.isUiEvent) return;
        generateFullCode();
    });
});

function getToolboxConfig() {
    return {
        'kind': 'categoryToolbox',
        'contents': [
            { 'kind': 'category', 'name': 'ОСНОВНЫЕ', 'colour': '260', 'contents': [{ 'kind': 'block', 'type': 'esp32_main_skeleton' }, { 'kind': 'block', 'type': 'esp32_delay' }] },
            { 'kind': 'category', 'name': 'GPIO', 'colour': '160', 'contents': [{ 'kind': 'block', 'type': 'esp32_pin_mode' }, { 'kind': 'block', 'type': 'esp32_digital_write' }] },
            { 'kind': 'category', 'name': 'Переменные', 'custom': 'VARIABLE', 'colour': '330' },
            { 'kind': 'category', 'name': 'Массивы', 'colour': '260', 'contents': [{ 'kind': 'block', 'type': 'lists_create_with' }] },
            { 'kind': 'category', 'name': 'Математика', 'colour': '230', 'contents': [{ 'kind': 'block', 'type': 'math_number' }, { 'kind': 'block', 'type': 'math_change' }] }
        ]
    };
}

function generateFullCode() {
    try {
        Blockly.Arduino.init(window.workspace);
        const code = Blockly.Arduino.workspaceToCode(window.workspace);
        const defs = Object.values(Blockly.Arduino.definitions_ || {}).join('\n');
        const setups = Object.values(Blockly.Arduino.setups_ || {}).join('\n  ');

        const fullCode = `#include <Arduino.h>\n\n${defs}\n\nvoid setup() {\n  Serial.begin(115200);\n  ${setups}\n}\n\nvoid loop() {\n${code}\n  delay(1);\n}`;
        if (window.codeViewer) window.codeViewer.setCode(fullCode, 'cpp');
    } catch (e) {
        console.error("Ошибка генерации:", e);
    }
}
