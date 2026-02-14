// Финальная стабильная конфигурация Blockly для ESP32
document.addEventListener('DOMContentLoaded', function() {
    if (window.workspace) return;
    
    const blocklyDiv = document.getElementById('blocklyDiv');
    if (!blocklyDiv) return;

    // 1. ОПРЕДЕЛЕНИЕ БЛОКОВ (Исправленные и дополненные)
    Blockly.defineBlocksWithJsonArray([
        {
            "type": "esp32_digital_write",
            "message0": "установить пин %1 в %2",
            "args0": [
                { "type": "field_number", "name": "PIN", "value": 2 },
                { "type": "field_dropdown", "name": "STATE", "options": [["ВЫСОКИЙ (HIGH)", "HIGH"], ["НИЗКИЙ (LOW)", "LOW"]] }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 160
        },
        {
            "type": "esp32_pin_mode",
            "message0": "настроить пин %1 как %2",
            "args0": [
                { "type": "field_number", "name": "PIN", "value": 2 },
                { "type": "field_dropdown", "name": "MODE", "options": [["ВЫХОД", "OUTPUT"], ["ВХОД", "INPUT"], ["ВХОД С ПОДТЯЖКОЙ", "INPUT_PULLUP"]] }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 160
        },
        {
            "type": "esp32_delay",
            "message0": "ждать %1 мс",
            "args0": [{ "type": "input_value", "name": "MS", "check": "Number" }],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 65
        }
    ]);

    // 2. СОЗДАНИЕ ГЕНЕРАТОРА ARDUINO
    Blockly.Arduino = new Blockly.Generator('Arduino');
    Blockly.Arduino.ORDER_ATOMIC = 0;
    Blockly.Arduino.ORDER_NONE = 99;

    // --- КРИТИЧЕСКИ ВАЖНЫЙ МОМЕНТ: НАСЛЕДОВАНИЕ СТАНДАРТНЫХ БЛОКОВ ---
    // Это лечит ошибку "does not know how to generate code for controls_if" и прочие
    if (Blockly.JavaScript) {
        const standardCategories = ['controls_if', 'controls_whileUntil', 'controls_repeat_ext', 'logic_compare', 
                                   'logic_operation', 'logic_negate', 'logic_boolean', 'math_number', 
                                   'math_arithmetic', 'text', 'variables_get', 'variables_set', 'procedures_defreturn', 'procedures_defnoreturn', 'procedures_callreturn', 'procedures_callnoreturn'];
        
        standardCategories.forEach(blockType => {
            if (Blockly.JavaScript.forBlock[blockType]) {
                Blockly.Arduino.forBlock[blockType] = Blockly.JavaScript.forBlock[blockType];
            }
        });
    }

    // 3. СПЕЦИФИЧНЫЕ ГЕНЕРАТОРЫ ДЛЯ ESP32
    Blockly.Arduino.forBlock['esp32_digital_write'] = function(block) {
        const pin = block.getFieldValue('PIN');
        const state = block.getFieldValue('STATE');
        return `digitalWrite(${pin}, ${state});\n`;
    };

    Blockly.Arduino.forBlock['esp32_pin_mode'] = function(block) {
        const pin = block.getFieldValue('PIN');
        const mode = block.getFieldValue('MODE');
        Blockly.Arduino.setups_['pin_mode_' + pin] = `pinMode(${pin}, ${mode});`;
        return '';
    };

    Blockly.Arduino.forBlock['esp32_delay'] = function(block, generator) {
        const ms = generator.valueToCode(block, 'MS', Blockly.Arduino.ORDER_NONE) || '1000';
        return `delay(${ms});\n`;
    };

    // 4. ИНИЦИАЛИЗАЦИЯ WORKSPACE
    window.workspace = Blockly.inject(blocklyDiv, {
        toolbox: getToolboxConfig(),
        media: 'https://unpkg.com/blockly/media/',
        grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
        trashcan: true,
        zoom: { controls: true, wheel: true }
    });

    // 5. НАСТРОЙКА ГЕНЕРАЦИИ
    Blockly.Arduino.init = function(workspace) {
        Blockly.Arduino.definitions_ = Object.create(null);
        Blockly.Arduino.setups_ = Object.create(null);
        Blockly.Arduino.variableDB_ = new Blockly.Names(Blockly.Names.DEVELOPER_VARIABLE_TYPE);
        Blockly.Arduino.variableDB_.setVariableMap(workspace.getVariableMap());
    };

    Blockly.Arduino.scrub_ = function(block, code, opt_thisOnly) {
        const nextBlock = block.getNextBlock();
        const nextCode = (nextBlock && !opt_thisOnly) ? Blockly.Arduino.blockToCode(nextBlock) : '';
        return code + nextCode;
    };

    // Обновление кода при каждом движении блока
    window.workspace.addChangeListener(function(event) {
        if (event.type !== Blockly.Events.UI) {
            generateFullCode();
        }
    });
});

// ГЕНЕРАЦИЯ ИТОГОВОГО C++ КОДА
function generateFullCode() {
    try {
        const loopCode = Blockly.Arduino.workspaceToCode(window.workspace);
        
        const definitions = Object.values(Blockly.Arduino.definitions_ || {}).join('\n');
        const setups = Object.values(Blockly.Arduino.setups_ || {}).join('\n    ');

        const fullCode = `
#include <Arduino.h>

// Глобальные переменные и функции
${definitions}

void setup() {
    Serial.begin(115200);
    ${setups}
}

void loop() {
${loopCode}
    delay(1); // Защита от WDT
}
`;
        if (window.codeViewer) {
            window.codeViewer.setCode(fullCode, 'cpp');
        }
    } catch (e) {
        console.error("Ошибка генерации:", e);
    }
}

// ПРАВИЛЬНЫЙ TOOLBOX (Со всеми категориями)
function getToolboxConfig() {
    return {
        'kind': 'categoryToolbox',
        'contents': [
            { 'kind': 'category', 'name': 'Логика', 'colour': '210', 'contents': [{ 'kind': 'block', 'type': 'controls_if' }, { 'kind': 'block', 'type': 'logic_compare' }] },
            { 'kind': 'category', 'name': 'Циклы', 'colour': '120', 'contents': [{ 'kind': 'block', 'type': 'controls_repeat_ext' }, { 'kind': 'block', 'type': 'controls_whileUntil' }] },
            { 'kind': 'category', 'name': 'Математика', 'colour': '230', 'contents': [{ 'kind': 'block', 'type': 'math_number' }, { 'kind': 'block', 'type': 'math_arithmetic' }] },
            { 'kind': 'category', 'name': 'GPIO', 'colour': '160', 'contents': [{ 'kind': 'block', 'type': 'esp32_pin_mode' }, { 'kind': 'block', 'type': 'esp32_digital_write' }] },
            { 'kind': 'category', 'name': 'Время', 'colour': '65', 'contents': [{ 'kind': 'block', 'type': 'esp32_delay' }] },
            { 'kind': 'category', 'name': 'Переменные', 'custom': 'VARIABLE', 'colour': '330' },
            { 'kind': 'category', 'name': 'Функции', 'custom': 'PROCEDURE', 'colour': '290' }
        ]
    };
}
