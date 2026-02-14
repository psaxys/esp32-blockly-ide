// Конфигурация Blockly для ESP32 с расширенным набором блоков
document.addEventListener('DOMContentLoaded', function() {
    if (window.workspace) return;
    const blocklyDiv = document.getElementById('blocklyDiv');

    // ---------------------------------------------------------
    // 1. ОПРЕДЕЛЕНИЕ БЛОКОВ (Визуальная часть)
    // ---------------------------------------------------------
    Blockly.defineBlocksWithJsonArray([
        // --- БАЗОВЫЕ GPIO ---
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
            "type": "esp32_digital_read",
            "message0": "читать цифровой пин %1",
            "args0": [{ "type": "field_number", "name": "PIN", "value": 0 }],
            "output": "Number", // Возвращает 0 или 1
            "colour": 160
        },
        {
            "type": "esp32_analog_read",
            "message0": "читать аналоговый пин %1",
            "args0": [{ "type": "field_number", "name": "PIN", "value": 34 }],
            "output": "Number",
            "colour": 160,
            "tooltip": "Возвращает значение от 0 до 4095"
        },
        {
            "type": "esp32_pwm_write",
            "message0": "ШИМ на пине %1 значение %2",
            "args0": [
                { "type": "field_number", "name": "PIN", "value": 2 },
                { "type": "input_value", "name": "NUM", "check": "Number" }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 160,
            "tooltip": "Значение от 0 до 255"
        },

        // --- ВРЕМЯ ---
        {
            "type": "esp32_delay",
            "message0": "ждать %1 мс",
            "args0": [{ "type": "field_number", "name": "MS", "value": 1000 }],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 65
        },
        {
            "type": "esp32_millis",
            "message0": "время с запуска (мс)",
            "output": "Number",
            "colour": 65
        },

        // --- SERIAL ---
        {
            "type": "esp32_serial_print",
            "message0": "Serial печать %1 (новая строка: %2)",
            "args0": [
                { "type": "input_value", "name": "TEXT" },
                { "type": "field_checkbox", "name": "NEWLINE", "checked": true }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 20
        },

        // --- ДАТЧИКИ И МОДУЛИ ---
        
        // Сервопривод
        {
            "type": "esp32_servo_write",
            "message0": "Серво на пине %1 угол %2",
            "args0": [
                { "type": "field_number", "name": "PIN", "value": 13 },
                { "type": "input_value", "name": "DEGREE", "check": "Number" }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230
        },
        
        // Ультразвуковой датчик (HC-SR04)
        {
            "type": "esp32_ultrasonic",
            "message0": "Дистанция (см) Trig %1 Echo %2",
            "args0": [
                { "type": "field_number", "name": "TRIG", "value": 5 },
                { "type": "field_number", "name": "ECHO", "value": 18 }
            ],
            "output": "Number",
            "colour": 230
        },

        // DHT11/22
        {
            "type": "esp32_dht_read",
            "message0": "DHT%1 пин %2 читать %3",
            "args0": [
                { "type": "field_dropdown", "name": "TYPE", "options": [["11", "DHT11"], ["22", "DHT22"]] },
                { "type": "field_number", "name": "PIN", "value": 4 },
                { "type": "field_dropdown", "name": "DATA", "options": [["Температуру", "temperature"], ["Влажность", "humidity"]] }
            ],
            "output": "Number",
            "colour": 230
        },

        // --- МАТЕМАТИКА (Map, Random) ---
        {
            "type": "esp32_map",
            "message0": "перевести %1 с (%2..%3) в (%4..%5)",
            "args0": [
                { "type": "input_value", "name": "NUM", "check": "Number" },
                { "type": "input_value", "name": "FMIN", "check": "Number" },
                { "type": "input_value", "name": "FMAX", "check": "Number" },
                { "type": "input_value", "name": "TMIN", "check": "Number" },
                { "type": "input_value", "name": "TMAX", "check": "Number" }
            ],
            "output": "Number",
            "colour": 230,
            "inputsInline": true
        },
        {
            "type": "esp32_random",
            "message0": "случайное от %1 до %2",
            "args0": [
                { "type": "input_value", "name": "MIN", "check": "Number" },
                { "type": "input_value", "name": "MAX", "check": "Number" }
            ],
            "output": "Number",
            "colour": 230,
            "inputsInline": true
        }
    ]);

    // ---------------------------------------------------------
    // 2. ИНИЦИАЛИЗАЦИЯ
    // ---------------------------------------------------------
    window.workspace = Blockly.inject(blocklyDiv, {
        toolbox: getToolboxConfig(),
        grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
        zoom: { controls: true, wheel: true },
        trashcan: true
    });

    // Настройка генератора
    Blockly.Arduino = new Blockly.Generator('Arduino');
    Blockly.Arduino.ORDER_ATOMIC = 0;
    Blockly.Arduino.ORDER_NONE = 99;

    Blockly.Arduino.init = function(workspace) {
        Blockly.Arduino.definitions_ = Object.create(null);
        Blockly.Arduino.setups_ = Object.create(null);
        Blockly.Arduino.libraries_ = Object.create(null); // Для хранения библиотек PlatformIO
        Blockly.Arduino.variableDB_ = new Blockly.Names(Blockly.Names.DEVELOPER_VARIABLE_TYPE);
        Blockly.Arduino.variableDB_.setVariableMap(workspace.getVariableMap());
    };

    Blockly.Arduino.scrub_ = function(block, code, opt_thisOnly) {
        const nextBlock = block.getNextBlock();
        const nextCode = (nextBlock && !opt_thisOnly) ? Blockly.Arduino.blockToCode(nextBlock) : '';
        return code + nextCode;
    };

    // ---------------------------------------------------------
    // 3. ГЕНЕРАТОРЫ (Превращение блоков в C++)
    // ---------------------------------------------------------

    // --- СТАНДАРТНЫЕ ---
    Blockly.Arduino.forBlock['math_number'] = function(block) {
        return [parseFloat(block.getFieldValue('NUM')), Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.forBlock['controls_if'] = function(block, generator) {
        let n = 0;
        let code = '';
        do {
            const condition = generator.valueToCode(block, 'IF' + n, Blockly.Arduino.ORDER_NONE) || 'false';
            const branch = generator.statementToCode(block, 'DO' + n);
            code += (n > 0 ? ' else ' : '') + `if (${condition}) {\n${branch}}`;
            n++;
        } while (block.getInput('IF' + n));
        if (block.getInput('ELSE')) {
            code += ` else {\n${generator.statementToCode(block, 'ELSE')}}`;
        }
        return code + '\n';
    };

    Blockly.Arduino.forBlock['controls_whileUntil'] = function(block, generator) {
        const mode = block.getFieldValue('MODE');
        const arg = generator.valueToCode(block, 'BOOL', Blockly.Arduino.ORDER_NONE) || 'false';
        const branch = generator.statementToCode(block, 'DO');
        const op = (mode === 'UNTIL') ? '!' : '';
        return `while (${op}${arg}) {\n${branch}  delay(1); // Watchdog reset\n}\n`;
    };

    // --- GPIO ---
    Blockly.Arduino.forBlock['esp32_pin_mode'] = function(block) {
        const pin = block.getFieldValue('PIN');
        const mode = block.getFieldValue('MODE');
        Blockly.Arduino.setups_['pin_mode_' + pin] = `pinMode(${pin}, ${mode});`;
        return '';
    };

    Blockly.Arduino.forBlock['esp32_digital_write'] = function(block) {
        const pin = block.getFieldValue('PIN');
        const state = block.getFieldValue('STATE');
        return `digitalWrite(${pin}, ${state});\n`;
    };

    Blockly.Arduino.forBlock['esp32_digital_read'] = function(block) {
        const pin = block.getFieldValue('PIN');
        return [`digitalRead(${pin})`, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.forBlock['esp32_analog_read'] = function(block) {
        const pin = block.getFieldValue('PIN');
        return [`analogRead(${pin})`, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.forBlock['esp32_pwm_write'] = function(block, generator) {
        const pin = block.getFieldValue('PIN');
        const val = generator.valueToCode(block, 'NUM', Blockly.Arduino.ORDER_NONE) || '0';
        return `analogWrite(${pin}, ${val});\n`; // В ядре ESP32 Arduino v2+ analogWrite поддерживается
    };

    // --- ВРЕМЯ ---
    Blockly.Arduino.forBlock['esp32_delay'] = function(block) {
        return `delay(${block.getFieldValue('MS')});\n`;
    };

    Blockly.Arduino.forBlock['esp32_millis'] = function(block) {
        return ['millis()', Blockly.Arduino.ORDER_ATOMIC];
    };

    // --- SERIAL ---
    Blockly.Arduino.forBlock['esp32_serial_print'] = function(block, generator) {
        const text = generator.valueToCode(block, 'TEXT', Blockly.Arduino.ORDER_NONE) || '""';
        const newline = block.getFieldValue('NEWLINE') === 'TRUE';
        return `Serial.${newline ? 'println' : 'print'}(${text});\n`;
    };

    // --- СЕРВОПРИВОД (Требует библиотеку ESP32Servo) ---
    Blockly.Arduino.forBlock['esp32_servo_write'] = function(block, generator) {
        const pin = block.getFieldValue('PIN');
        const degree = generator.valueToCode(block, 'DEGREE', Blockly.Arduino.ORDER_NONE) || '90';
        
        Blockly.Arduino.libraries_['ESP32Servo'] = '#include <ESP32Servo.h>';
        Blockly.Arduino.definitions_['servo_' + pin] = `Servo servo_${pin};`;
        Blockly.Arduino.setups_['servo_attach_' + pin] = `servo_${pin}.attach(${pin});`;
        
        return `servo_${pin}.write(${degree});\n`;
    };

    // --- УЛЬТРАЗВУК (Без библиотеки, напрямую) ---
    Blockly.Arduino.forBlock['esp32_ultrasonic'] = function(block) {
        const trig = block.getFieldValue('TRIG');
        const echo = block.getFieldValue('ECHO');
        
        Blockly.Arduino.setups_['ultrasonic_' + trig] = `pinMode(${trig}, OUTPUT);\npinMode(${echo}, INPUT);`;
        
        // Встраиваем функцию чтения дистанции один раз
        Blockly.Arduino.definitions_['func_get_dist'] = `
float getDistance(int trig, int echo) {
  digitalWrite(trig, LOW);
  delayMicroseconds(2);
  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig, LOW);
  long duration = pulseIn(echo, HIGH);
  return duration * 0.034 / 2;
}`;
        return [`getDistance(${trig}, ${echo})`, Blockly.Arduino.ORDER_ATOMIC];
    };

    // --- DHT (Требует DHT sensor library) ---
    Blockly.Arduino.forBlock['esp32_dht_read'] = function(block) {
        const type = block.getFieldValue('TYPE');
        const pin = block.getFieldValue('PIN');
        const data = block.getFieldValue('DATA');
        
        Blockly.Arduino.libraries_['DHT'] = '#include "DHT.h"';
        Blockly.Arduino.definitions_['dht_' + pin] = `DHT dht_${pin}(${pin}, ${type});`;
        Blockly.Arduino.setups_['dht_begin_' + pin] = `dht_${pin}.begin();`;
        
        return [data === 'temperature' ? `dht_${pin}.readTemperature()` : `dht_${pin}.readHumidity()`, Blockly.Arduino.ORDER_ATOMIC];
    };

    // --- MATH & VARS ---
    Blockly.Arduino.forBlock['esp32_map'] = function(block, generator) {
        const num = generator.valueToCode(block, 'NUM', Blockly.Arduino.ORDER_NONE) || '0';
        const fmin = generator.valueToCode(block, 'FMIN', Blockly.Arduino.ORDER_NONE) || '0';
        const fmax = generator.valueToCode(block, 'FMAX', Blockly.Arduino.ORDER_NONE) || '1023';
        const tmin = generator.valueToCode(block, 'TMIN', Blockly.Arduino.ORDER_NONE) || '0';
        const tmax = generator.valueToCode(block, 'TMAX', Blockly.Arduino.ORDER_NONE) || '255';
        return [`map(${num}, ${fmin}, ${fmax}, ${tmin}, ${tmax})`, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.forBlock['esp32_random'] = function(block, generator) {
        const min = generator.valueToCode(block, 'MIN', Blockly.Arduino.ORDER_NONE) || '0';
        const max = generator.valueToCode(block, 'MAX', Blockly.Arduino.ORDER_NONE) || '100';
        return [`random(${min}, ${max})`, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.forBlock['variables_set'] = function(block, generator) {
        const val = generator.valueToCode(block, 'VALUE', Blockly.Arduino.ORDER_NONE) || '0';
        const name = generator.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
        Blockly.Arduino.definitions_['var_' + name] = `float ${name} = 0;`;
        return `${name} = ${val};\n`;
    };

    Blockly.Arduino.forBlock['variables_get'] = function(block, generator) {
        const name = generator.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
        return [name, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.forBlock['logic_compare'] = function(block, generator) {
        const op = block.getFieldValue('OP') === 'EQ' ? '==' : 
                   block.getFieldValue('OP') === 'NEQ' ? '!=' :
                   block.getFieldValue('OP') === 'LT' ? '<' :
                   block.getFieldValue('OP') === 'LTE' ? '<=' :
                   block.getFieldValue('OP') === 'GT' ? '>' : '>=';
        const a = generator.valueToCode(block, 'A', Blockly.Arduino.ORDER_NONE) || '0';
        const b = generator.valueToCode(block, 'B', Blockly.Arduino.ORDER_NONE) || '0';
        return [`${a} ${op} ${b}`, Blockly.Arduino.ORDER_ATOMIC];
    };

    // Авто-генерация при изменении
    window.workspace.addChangeListener(function(e) {
        if (e.type !== Blockly.Events.UI) generateCode();
    });
});

// ---------------------------------------------------------
// 4. ФИНАЛЬНАЯ СБОРКА
// ---------------------------------------------------------
function generateCode() {
    try {
        const loopCode = Blockly.Arduino.workspaceToCode(window.workspace);
        
        // Собираем библиотеки и определения
        const libraries = Object.values(Blockly.Arduino.libraries_ || {}).join('\n');
        const definitions = Object.values(Blockly.Arduino.definitions_ || {}).join('\n');
        const setups = Object.values(Blockly.Arduino.setups_ || {}).join('\n    ');

        // Генерируем полный файл
        const fullCode = `
#include <Arduino.h>
${libraries}

// Глобальные переменные
${definitions}

void setup() {
    Serial.begin(115200);
    ${setups}
}

void loop() {
${loopCode}
    delay(10); // Пауза для стабильности
}
`;
        if (window.codeViewer) window.codeViewer.setCode(fullCode, 'cpp');
        return fullCode;
    } catch (e) {
        console.error(e);
        return "// Ошибка: " + e.message;
    }
}

function getToolboxConfig() {
    return {
        'kind': 'categoryToolbox',
        'contents': [
            {
                'kind': 'category',
                'name': 'Ввод/Вывод',
                'colour': '160',
                'contents': [
                    { 'kind': 'block', 'type': 'esp32_pin_mode' },
                    { 'kind': 'block', 'type': 'esp32_digital_write' },
                    { 'kind': 'block', 'type': 'esp32_digital_read' },
                    { 'kind': 'block', 'type': 'esp32_analog_read' },
                    { 'kind': 'block', 'type': 'esp32_pwm_write' }
                ]
            },
            {
                'kind': 'category',
                'name': 'Модули',
                'colour': '230',
                'contents': [
                    { 'kind': 'block', 'type': 'esp32_servo_write' },
                    { 'kind': 'block', 'type': 'esp32_ultrasonic' },
                    { 'kind': 'block', 'type': 'esp32_dht_read' }
                ]
            },
            {
                'kind': 'category',
                'name': 'Логика и Время',
                'colour': '210',
                'contents': [
                    { 'kind': 'block', 'type': 'controls_if' },
                    { 'kind': 'block', 'type': 'logic_compare' },
                    { 'kind': 'block', 'type': 'controls_whileUntil' },
                    { 'kind': 'block', 'type': 'esp32_delay' },
                    { 'kind': 'block', 'type': 'esp32_millis' },
                    { 'kind': 'block', 'type': 'esp32_random' },
                    { 'kind': 'block', 'type': 'esp32_map' }
                ]
            },
            {
                'kind': 'category',
                'name': 'Serial',
                'colour': '20',
                'contents': [
                    { 'kind': 'block', 'type': 'esp32_serial_print' }
                ]
            },
            {
                'kind': 'category',
                'name': 'Переменные',
                'custom': 'VARIABLE',
                'colour': '330'
            },
            {
                'kind': 'category',
                'name': 'Числа',
                'colour': '230',
                'contents': [
                    { 'kind': 'block', 'type': 'math_number' }
                ]
            }
        ]
    };
}
