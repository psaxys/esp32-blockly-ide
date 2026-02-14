// 1. Инициализация кастомных блоков ESP32
Blockly.defineBlocksWithJsonArray([
    {
        "type": "esp32_pin_mode",
        "message0": "настроить пин %1 как %2",
        "args0": [
            { "type": "field_number", "name": "PIN", "value": 2, "min": 0, "max": 39 },
            { "type": "field_dropdown", "name": "MODE", "options": [["ВЫХОД (OUTPUT)", "OUTPUT"], ["ВХОД (INPUT)", "INPUT"], ["ВХОД С ПОДТЯЖКОЙ", "INPUT_PULLUP"]] }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 160
    },
    {
        "type": "esp32_digital_write",
        "message0": "на пине %1 установить %2",
        "args0": [
            { "type": "field_number", "name": "PIN", "value": 2 },
            { "type": "field_dropdown", "name": "STATE", "options": [["ВЫСОКИЙ (HIGH)", "HIGH"], ["НИЗКИЙ (LOW)", "LOW"]] }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 160
    },
    {
        "type": "esp32_delay",
        "message0": "ждать %1 мс",
        "args0": [{ "type": "field_number", "name": "MS", "value": 1000 }],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 65
    },
    {
        "type": "esp32_serial_print",
        "message0": "отправить в Serial %1",
        "args0": [{ "type": "input_value", "name": "TEXT" }],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 20
    }
]);

document.addEventListener('DOMContentLoaded', function() {
    if (window.workspace) return;
    const blocklyDiv = document.getElementById('blocklyDiv');
    
    // 2. Инициализация Workspace
    window.workspace = Blockly.inject(blocklyDiv, {
        toolbox: getToolboxConfig(),
        grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
        trashcan: true
    });

    // 3. Создание и настройка генератора Arduino (C++)
    Blockly.Arduino = new Blockly.Generator('Arduino');
    Blockly.Arduino.ORDER_ATOMIC = 0;
    Blockly.Arduino.ORDER_NONE = 99;

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

    // 4. ЛОГИКА ГЕНЕРАЦИИ ДЛЯ КАЖДОГО БЛОКА

    // Математика (числа)
    Blockly.Arduino.forBlock['math_number'] = function(block) {
        return [parseFloat(block.getFieldValue('NUM')), Blockly.Arduino.ORDER_ATOMIC];
    };

    // Цикл While
    Blockly.Arduino.forBlock['controls_whileUntil'] = function(block, generator) {
        const mode = block.getFieldValue('MODE');
        const argument0 = generator.valueToCode(block, 'BOOL', Blockly.Arduino.ORDER_NONE) || 'false';
        let branch = generator.statementToCode(block, 'DO');
        const op = (mode === 'UNTIL') ? '!' : '';
        return `  while (${op}${argument0}) {\n${branch}    yield(); // Чтобы ESP32 не перезагружалась\n  }\n`;
    };

    // ПинMode (уходит в setup)
    Blockly.Arduino.forBlock['esp32_pin_mode'] = function(block) {
        const pin = block.getFieldValue('PIN');
        const mode = block.getFieldValue('MODE');
        Blockly.Arduino.setups_['pin_mode_' + pin] = `pinMode(${pin}, ${mode});`;
        return ''; 
    };

    // DigitalWrite
    Blockly.Arduino.forBlock['esp32_digital_write'] = function(block) {
        const pin = block.getFieldValue('PIN');
        const state = block.getFieldValue('STATE');
        return `  digitalWrite(${pin}, ${state});\n`;
    };

    // Delay
    Blockly.Arduino.forBlock['esp32_delay'] = function(block) {
        return `  delay(${block.getFieldValue('MS')});\n`;
    };

    // Serial Print
    Blockly.Arduino.forBlock['esp32_serial_print'] = function(block, generator) {
        const value = generator.valueToCode(block, 'TEXT', Blockly.Arduino.ORDER_NONE) || '""';
        return `  Serial.println(${value});\n`;
    };

    // Переменные
    Blockly.Arduino.forBlock['variables_set'] = function(block, generator) {
        const val = generator.valueToCode(block, 'VALUE', Blockly.Arduino.ORDER_NONE) || '0';
        const name = generator.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
        // Добавляем объявление в глобальную область
        Blockly.Arduino.definitions_['var_' + name] = `float ${name} = 0;`;
        return `${name} = ${val};\n`;
    };

    Blockly.Arduino.forBlock['variables_get'] = function(block, generator) {
        const name = generator.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
        return [name, Blockly.Arduino.ORDER_ATOMIC];
    };

    // Обновление кода при изменениях
    window.workspace.addChangeListener(generateCode);
});

// 5. ФУНКЦИЯ СБОРКИ ФИНАЛЬНОЙ ПРОГРАММЫ
function generateCode() {
    try {
        const loopCode = Blockly.Arduino.workspaceToCode(window.workspace);
        
        const definitions = Object.values(Blockly.Arduino.definitions_).join('\n');
        const setups = Object.values(Blockly.Arduino.setups_).join('\n    ');

        const fullCode = `
#include <Arduino.h>

// Глобальные переменные
${definitions}

void setup() {
    Serial.begin(115200);
    delay(1000);
    ${setups}
    Serial.println("ESP32 Ready");
}

void loop() {
${loopCode}
    delay(1); // Стабилизация планировщика
}
`;

        if (window.codeViewer) {
            window.codeViewer.setCode(fullCode, 'cpp');
        }
        return fullCode;
    } catch (e) {
        console.error("Ошибка генерации:", e);
        return "// Ошибка: " + e.message;
    }
}

function getToolboxConfig() {
    return {
        'kind': 'categoryToolbox',
        'contents': [
            { 'kind': 'category', 'name': 'Железо', 'colour': '160', 'contents': [
                { 'kind': 'block', 'type': 'esp32_pin_mode' },
                { 'kind': 'block', 'type': 'esp32_digital_write' },
                { 'kind': 'block', 'type': 'esp32_delay' }
            ]},
            { 'kind': 'category', 'name': 'Связь', 'colour': '20', 'contents': [
                { 'kind': 'block', 'type': 'esp32_serial_print' }
            ]},
            { 'kind': 'category', 'name': 'Циклы', 'colour': '120', 'contents': [
                { 'kind': 'block', 'type': 'controls_whileUntil' }
            ]},
            { 'kind': 'category', 'name': 'Переменные', 'custom': 'VARIABLE', 'colour': '330' }
        ]
    };
}
