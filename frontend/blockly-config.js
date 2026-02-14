// Полная конфигурация Blockly для ESP32 (Arduino C++)
document.addEventListener('DOMContentLoaded', function() {
    if (window.workspace) return;
    const blocklyDiv = document.getElementById('blocklyDiv');

    // --- 1. ОПРЕДЕЛЕНИЕ СПЕЦИФИЧЕСКИХ БЛОКОВ (JSON) ---
    Blockly.defineBlocksWithJsonArray([
        // Категория: Время
        { "type": "time_delay", "message0": "ждать %1 мс", "args0": [{"type": "input_value", "name": "DELAY", "check": "Number"}], "previousStatement": null, "nextStatement": null, "colour": 65 },
        { "type": "time_millis", "message0": "миллисекунд с запуска", "output": "Number", "colour": 65 },
        
        // Категория: Моторы (Servo)
        { "type": "servo_move", "message0": "Серво пин %1 угол %2 (0-180)", "args0": [{"type": "field_number", "name": "PIN", "value": 13}, {"type": "input_value", "name": "DEGREE", "check": "Number"}], "previousStatement": null, "nextStatement": null, "colour": 100 },
        
        // Категория: Дисплей (OLED I2C)
        { "type": "oled_print", "message0": "OLED текст %1 строка %2", "args0": [{"type": "input_value", "name": "TEXT"}, {"type": "field_number", "name": "LINE", "value": 0}], "previousStatement": null, "nextStatement": null, "colour": 190 }
    ]);

    // --- 2. ИНИЦИАЛИЗАЦИЯ WORKSPACE ---
    window.workspace = Blockly.inject(blocklyDiv, {
        toolbox: getFullToolboxConfig(),
        grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
        zoom: { controls: true, wheel: true, startScale: 1.0 },
        trashcan: true
    });

    // --- 3. НАСТРОЙКА ГЕНЕРАТОРА ARDUINO ---
    Blockly.Arduino = new Blockly.Generator('Arduino');
    Blockly.Arduino.ORDER_ATOMIC = 0;
    Blockly.Arduino.ORDER_NONE = 99;

    Blockly.Arduino.init = function(workspace) {
        Blockly.Arduino.definitions_ = Object.create(null);
        Blockly.Arduino.setups_ = Object.create(null);
        Blockly.Arduino.libraries_ = Object.create(null);
        Blockly.Arduino.variableDB_ = new Blockly.Names(Blockly.Names.DEVELOPER_VARIABLE_TYPE);
        Blockly.Arduino.variableDB_.setVariableMap(workspace.getVariableMap());
    };

    Blockly.Arduino.scrub_ = function(block, code, opt_thisOnly) {
        const nextBlock = block.getNextBlock();
        const nextCode = (nextBlock && !opt_thisOnly) ? Blockly.Arduino.blockToCode(nextBlock) : '';
        return code + nextCode;
    };

    // --- 4. РЕАЛИЗАЦИЯ ЛОГИКИ ГЕНЕРАТОРОВ ---

    // Базовые входы/выходы
    Blockly.Arduino.forBlock['esp32_digital_write'] = function(block) {
        const pin = block.getFieldValue('PIN');
        const state = block.getFieldValue('STATE');
        return `digitalWrite(${pin}, ${state});\n`;
    };

    // Время
    Blockly.Arduino.forBlock['time_delay'] = function(block, generator) {
        const delay = generator.valueToCode(block, 'DELAY', Blockly.Arduino.ORDER_NONE) || '1000';
        return `delay(${delay});\n`;
    };

    // Серво (Моторы)
    Blockly.Arduino.forBlock['servo_move'] = function(block, generator) {
        const pin = block.getFieldValue('PIN');
        const degree = generator.valueToCode(block, 'DEGREE', Blockly.Arduino.ORDER_NONE) || '90';
        Blockly.Arduino.libraries_['servo'] = '#include <ESP32Servo.h>';
        Blockly.Arduino.definitions_['servo_' + pin] = `Servo servo_${pin};`;
        Blockly.Arduino.setups_['servo_' + pin] = `servo_${pin}.attach(${pin});`;
        return `servo_${pin}.write(${degree});\n`;
    };

    // Обновление Monaco Editor
    window.workspace.addChangeListener(() => generateFullCode());
});

// --- 5. КОНФИГУРАЦИЯ TOOLBOX (ВСЕ ВАШИ КАТЕГОРИИ) ---
function getFullToolboxConfig() {
    return {
        'kind': 'categoryToolbox',
        'contents': [
            { 'kind': 'category', 'name': 'Логика', 'colour': '210', 'contents': [{ 'kind': 'block', 'type': 'controls_if' }, { 'kind': 'block', 'type': 'logic_compare' }] },
            { 'kind': 'category', 'name': 'Циклы', 'colour': '120', 'contents': [{ 'kind': 'block', 'type': 'controls_repeat_ext' }, { 'kind': 'block', 'type': 'controls_whileUntil' }] },
            { 'kind': 'category', 'name': 'Математика', 'colour': '230', 'contents': [{ 'kind': 'block', 'type': 'math_number' }, { 'kind': 'block', 'type': 'math_arithmetic' }] },
            { 'kind': 'category', 'name': 'Текст', 'colour': '160', 'contents': [{ 'kind': 'block', 'type': 'text' }, { 'kind': 'block', 'type': 'text_print' }] },
            { 'kind': 'category', 'name': 'Время', 'colour': '65', 'contents': [{ 'kind': 'block', 'type': 'time_delay' }, { 'kind': 'block', 'type': 'time_millis' }] },
            { 'kind': 'category', 'name': 'Переменные', 'custom': 'VARIABLE', 'colour': '330' },
            { 'kind': 'category', 'name': 'Массивы', 'colour': '260', 'contents': [{ 'kind': 'block', 'type': 'lists_create_with' }] },
            { 'kind': 'category', 'name': 'Функции', 'custom': 'PROCEDURE', 'colour': '290' },
            { 'kind': 'sep' },
            { 'kind': 'category', 'name': 'Входы / Выходы', 'colour': '160', 'contents': [{ 'kind': 'block', 'type': 'esp32_digital_write' }] },
            { 'kind': 'category', 'name': 'Монитор порта', 'colour': '20', 'contents': [{ 'kind': 'block', 'type': 'esp32_serial_print' }] },
            { 'kind': 'category', 'name': 'Модули связи', 'colour': '0', 'contents': [] }, // WiFi/BLE
            { 'kind': 'category', 'name': 'Место хранения', 'colour': '45', 'contents': [] }, // EEPROM/SD
            { 'kind': 'category', 'name': 'Моторы', 'colour': '100', 'contents': [{ 'kind': 'block', 'type': 'servo_move' }] },
            { 'kind': 'category', 'name': 'Сенсоры', 'colour': '230', 'contents': [{ 'kind': 'block', 'type': 'esp32_ultrasonic' }] },
            { 'kind': 'sep' },
            { 'kind': 'category', 'name': 'Индикаторы', 'colour': '0', 'contents': [] },
            { 'kind': 'category', 'name': 'Дисплей OLED', 'colour': '190', 'contents': [{ 'kind': 'block', 'type': 'oled_print' }] }
        ]
    };
}

// --- 6. ФУНКЦИЯ ГЕНЕРАЦИИ КОДА ---
function generateFullCode() {
    try {
        const blockCode = Blockly.Arduino.workspaceToCode(window.workspace);
        const libs = Object.values(Blockly.Arduino.libraries_ || {}).join('\n');
        const defs = Object.values(Blockly.Arduino.definitions_ || {}).join('\n');
        const setups = Object.values(Blockly.Arduino.setups_ || {}).join('\n    ');

        const code = `#include <Arduino.h>\n${libs}\n\n${defs}\n\nvoid setup() {\n    Serial.begin(115200);\n    ${setups}\n}\n\nvoid loop() {\n${blockCode}\n}`;
        
        if (window.codeViewer) window.codeViewer.setCode(code, 'cpp');
        return code;
    } catch (e) { console.error(e); return ""; }
}
