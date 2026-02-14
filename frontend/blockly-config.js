// Финальная стабильная конфигурация Blockly 12.3.1 для ESP32
document.addEventListener('DOMContentLoaded', function() {
    if (window.workspace) return;
    
    const blocklyDiv = document.getElementById('blocklyDiv');
    if (!blocklyDiv) return;

    // 1. РЕГИСТРАЦИЯ БЛОКОВ
    Blockly.defineBlocksWithJsonArray([
        {
            "type": "esp32_digital_write",
            "message0": "записать на пин %1 значение %2",
            "args0": [
                { "type": "field_number", "name": "PIN", "value": 2 },
                { "type": "field_dropdown", "name": "STATE", "options": [["ВЫСОКИЙ", "HIGH"], ["НИЗКИЙ", "LOW"]] }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 160
        },
        {
            "type": "esp32_delay",
            "message0": "пауза %1 мс",
            "args0": [{ "type": "input_value", "name": "MS", "check": "Number" }],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 65
        }
    ]);

    // 2. ИНИЦИАЛИЗАЦИЯ ГЕНЕРАТОРА ARDUINO
    // Мы создаем класс, который наследует логику JavaScript генератора правильно
    Blockly.Arduino = new Blockly.Generator('Arduino');
    
    // Настройка приоритетов
    Blockly.Arduino.ORDER_ATOMIC = 0;
    Blockly.Arduino.ORDER_NONE = 99;

    // 3. ИСПРАВЛЕНИЕ ОШИБКИ nameDB_ (КРИТИЧЕСКОЕ ИЗМЕНЕНИЕ)
    // Эта функция вызывается перед началом генерации кода
    Blockly.Arduino.init = function(workspace) {
        // Создаем необходимые словари
        Blockly.Arduino.definitions_ = Object.create(null);
        Blockly.Arduino.setups_ = Object.create(null);
        
        // Инициализируем базу имен для переменных (исправляет ошибку в логах)
        if (!Blockly.Arduino.nameDB_) {
            Blockly.Arduino.nameDB_ = new Blockly.Names(Blockly.Arduino.RESERVED_WORDS_);
        } else {
            Blockly.Arduino.nameDB_.reset();
        }
        
        // Связываем базу имен с воркспейсом
        Blockly.Arduino.nameDB_.setVariableMap(workspace.getVariableMap());

        // Формируем список переменных в начале кода
        const defvars = [];
        const variables = workspace.getAllVariables();
        if (variables.length) {
            for (let i = 0; i < variables.length; i++) {
                defvars[i] = 'float ' + Blockly.Arduino.nameDB_.getName(variables[i].getId(), Blockly.Variables.NAME_TYPE) + ' = 0;';
            }
            Blockly.Arduino.definitions_['variables'] = defvars.join('\n');
        }
    };

    // 4. КОПИРОВАНИЕ СТАНДАРТНОЙ ЛОГИКИ
    if (Blockly.JavaScript) {
        const blocksToCopy = [
            'controls_if', 'logic_compare', 'logic_operation', 'logic_negate', 'logic_boolean',
            'math_number', 'math_arithmetic', 'variables_get', 'variables_set', 'controls_repeat_ext'
        ];
        
        blocksToCopy.forEach(type => {
            Blockly.Arduino.forBlock[type] = function(block, generator) {
                // Вызываем оригинальный генератор JavaScript, но в контексте Arduino
                return Blockly.JavaScript.forBlock[type](block, generator);
            };
        });
    }

    // 5. ГЕНЕРАТОРЫ ДЛЯ НАШИХ БЛОКОВ
    Blockly.Arduino.forBlock['esp32_digital_write'] = function(block) {
        const pin = block.getFieldValue('PIN');
        const state = block.getFieldValue('STATE');
        return `digitalWrite(${pin}, ${state});\n`;
    };

    Blockly.Arduino.forBlock['esp32_delay'] = function(block, generator) {
        const ms = generator.valueToCode(block, 'MS', Blockly.Arduino.ORDER_NONE) || '1000';
        return `delay(${ms});\n`;
    };

    Blockly.Arduino.scrub_ = function(block, code, opt_thisOnly) {
        const nextBlock = block.getNextBlock();
        const nextCode = (nextBlock && !opt_thisOnly) ? Blockly.Arduino.blockToCode(nextBlock) : '';
        return code + nextCode;
    };

    // 6. ЗАПУСК WORKSPACE
    window.workspace = Blockly.inject(blocklyDiv, {
        toolbox: getToolboxConfig(),
        media: 'https://unpkg.com/blockly/media/',
        trashcan: true,
        zoom: { controls: true, wheel: true }
    });

    // Авто-генерация при изменениях
    window.workspace.addChangeListener((e) => {
        if (e.isUiEvent) return;
        generateFullCode();
    });
});

function generateFullCode() {
    try {
        // Вызываем init вручную для настройки nameDB_
        Blockly.Arduino.init(window.workspace);
        
        const blockCode = Blockly.Arduino.workspaceToCode(window.workspace);
        const defs = Object.values(Blockly.Arduino.definitions_).join('\n');
        const setups = Object.values(Blockly.Arduino.setups_).join('\n  ');

        const fullCode = `
#include <Arduino.h>

${defs}

void setup() {
  Serial.begin(115200);
  ${setups}
}

void loop() {
${blockCode}
  delay(1);
}`;

        if (window.codeViewer) {
            window.codeViewer.setCode(fullCode, 'cpp');
        }
    } catch (e) {
        console.error("Ошибка генерации:", e);
    }
}

function getToolboxConfig() {
    return {
        'kind': 'categoryToolbox',
        'contents': [
            { 'kind': 'category', 'name': 'Логика', 'colour': '210', 'contents': [{ 'kind': 'block', 'type': 'controls_if' }, { 'kind': 'block', 'type': 'logic_compare' }] },
            { 'kind': 'category', 'name': 'Переменные', 'custom': 'VARIABLE', 'colour': '330' },
            { 'kind': 'category', 'name': 'GPIO', 'colour': '160', 'contents': [{ 'kind': 'block', 'type': 'esp32_digital_write' }] },
            { 'kind': 'category', 'name': 'Время', 'colour': '65', 'contents': [{ 'kind': 'block', 'type': 'esp32_delay' }] }
        ]
    };
}
