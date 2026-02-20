// ПОЛНАЯ КОНФИГУРАЦИЯ BLOCKLY ДЛЯ ESP32 (V2.5)
// ВОССТАНОВЛЕНЫ: СТРОКИ, ВСЕ СТАНДАРТНЫЕ БЛОКИ, ИСПРАВЛЕНЫ ОШИБКИ v12+

document.addEventListener('DOMContentLoaded', function() {
    if (window.workspace) return; 

    const blocklyDiv = document.getElementById('blocklyDiv');
    if (!blocklyDiv) return;

    // 1. ОПРЕДЕЛЕНИЕ БЛОКОВ (JSON) - ПОЛНЫЙ СПИСОК
    Blockly.defineBlocksWithJsonArray([
        { "type": "esp32_delay", "message0": "ждать %1 мс", "args0": [{ "type": "input_value", "name": "MS", "check": "Number" }], "previousStatement": null, "nextStatement": null, "colour": 65 },
        { "type": "esp32_millis", "message0": "время с старта (мс)", "output": "Number", "colour": 65 },
        { "type": "esp32_micros", "message0": "время с старта (мкс)", "output": "Number", "colour": 65 },
        { "type": "esp32_delaymicroseconds", "message0": "ждать %1 мкс", "args0": [{ "type": "input_value", "name": "US", "check": "Number" }], "previousStatement": null, "nextStatement": null, "colour": 65 },
        { "type": "esp32_pin_mode", "message0": "настроить пин %1 как %2", "args0": [{ "type": "field_number", "name": "PIN", "value": 2, "min": 0, "max": 39 }, { "type": "field_dropdown", "name": "MODE", "options": [["ВЫХОД (OUTPUT)", "OUTPUT"], ["ВХОД (INPUT)", "INPUT"], ["ВХОД С ПОДТЯЖКОЙ", "INPUT_PULLUP"]] }], "previousStatement": null, "nextStatement": null, "colour": 160 },
        { "type": "esp32_digital_write", "message0": "цифровой пин %1 установить %2", "args0": [{ "type": "field_number", "name": "PIN", "value": 2 }, { "type": "field_dropdown", "name": "STATE", "options": [["HIGH", "HIGH"], ["LOW", "LOW"]] }], "previousStatement": null, "nextStatement": null, "colour": 160 },
        { "type": "esp32_digital_read", "message0": "читать цифровой пин %1", "args0": [{ "type": "field_number", "name": "PIN", "value": 0 }], "output": "Number", "colour": 160 },
        { "type": "esp32_analog_read", "message0": "читать аналоговый пин %1", "args0": [{ "type": "field_number", "name": "PIN", "value": 34 }], "output": "Number", "colour": 160 },
        { "type": "esp32_pwm_write", "message0": "ШИМ (Analog) пин %1 знач %2", "args0": [{ "type": "field_number", "name": "PIN", "value": 2 }, { "type": "input_value", "name": "VAL", "check": "Number" }], "previousStatement": null, "nextStatement": null, "colour": 160 },
        { "type": "esp32_pwm_freq", "message0": "ШИМ частота %1 Гц канал %2", "args0": [{ "type": "input_value", "name": "FREQ", "check": "Number" }, { "type": "field_number", "name": "CHANNEL", "value": 0, "min": 0, "max": 15 }], "previousStatement": null, "nextStatement": null, "colour": 160 },
        { "type": "esp32_adc_width", "message0": "разрядность ADC %1", "args0": [{ "type": "field_dropdown", "name": "WIDTH", "options": [["9 бит", "9"], ["10 бит", "10"], ["11 бит", "11"], ["12 бит", "12"]] }], "previousStatement": null, "nextStatement": null, "colour": 160 },
        { "type": "esp32_serial_init", "message0": "Serial скорость %1", "args0": [{ "type": "field_number", "name": "BAUD", "value": 115200 }], "previousStatement": null, "nextStatement": null, "colour": 20 },
        { "type": "esp32_serial_print", "message0": "Serial печать %1 (новая строка: %2)", "args0": [{ "type": "input_value", "name": "MSG" }, { "type": "field_checkbox", "name": "NL", "checked": true }], "previousStatement": null, "nextStatement": null, "colour": 20 },
        { "type": "esp32_serial_println", "message0": "Serial println %1", "args0": [{ "type": "input_value", "name": "MSG" }], "previousStatement": null, "nextStatement": null, "colour": 20 },
        { "type": "esp32_serial_available", "message0": "Serial данные доступны?", "output": "Boolean", "colour": 20 },
        { "type": "esp32_serial_read", "message0": "Serial чтение", "output": "Number", "colour": 20 },
        { "type": "esp32_serial_peek", "message0": "Serial peek", "output": "Number", "colour": 20 },
        { "type": "esp32_serial_flush", "message0": "Serial flush", "previousStatement": null, "nextStatement": null, "colour": 20 },
        { "type": "esp32_interrupt", "message0": "Прерывание на пине %1 режим %2 %3 выполнять %4", "args0": [{ "type": "field_number", "name": "PIN", "value": 0 }, { "type": "field_dropdown", "name": "MODE", "options": [["ИЗМЕНЕНИЕ (CHANGE)", "CHANGE"], ["РОСТ (RISING)", "RISING"], ["СПАД (FALLING)", "FALLING"]] }, { "type": "input_dummy" }, { "type": "input_statement", "name": "DO" }], "previousStatement": null, "nextStatement": null, "colour": 290 },
        { "type": "esp32_detach_interrupt", "message0": "отключить прерывание пин %1", "args0": [{ "type": "field_number", "name": "PIN", "value": 0 }], "previousStatement": null, "nextStatement": null, "colour": 290 },
        { "type": "lcd_i2c_init", "message0": "LCD I2C иниц. адрес 0x%1 колог %2 строк %3", "args0": [{ "type": "field_input", "name": "ADDR", "text": "27" }, { "type": "field_number", "name": "COLS", "value": 16 }, { "type": "field_number", "name": "ROWS", "value": 2 }], "previousStatement": null, "nextStatement": null, "colour": 190 },
        { "type": "lcd_i2c_print", "message0": "LCD печать %1 на стр %2 поз %3", "args0": [{ "type": "input_value", "name": "TEXT" }, { "type": "field_number", "name": "ROW", "value": 0 }, { "type": "field_number", "name": "COL", "value": 0 }], "previousStatement": null, "nextStatement": null, "colour": 190 },
        { "type": "lcd_i2c_clear", "message0": "LCD очистить", "previousStatement": null, "nextStatement": null, "colour": 190 },
        { "type": "lcd_i2c_cursor", "message0": "LCD курсор (стр %1, кол %2)", "args0": [{ "type": "field_number", "name": "ROW", "value": 0 }, { "type": "field_number", "name": "COL", "value": 0 }], "previousStatement": null, "nextStatement": null, "colour": 190 },
        { "type": "lcd_i2c_backlight", "message0": "LCD подсветка %1", "args0": [{ "type": "field_dropdown", "name": "STATE", "options": [["ВКЛ", "ON"], ["ВЫКЛ", "OFF"]] }], "previousStatement": null, "nextStatement": null, "colour": 190 },
        { "type": "oled_init", "message0": "OLED иниц. (128x64 I2C)", "previousStatement": null, "nextStatement": null, "colour": 180 },
        { "type": "oled_print", "message0": "OLED текст %1 размер %2 x %3 y %4", "args0": [{ "type": "input_value", "name": "TEXT" }, { "type": "field_number", "name": "SIZE", "value": 1 }, { "type": "field_number", "name": "X", "value": 0 }, { "type": "field_number", "name": "Y", "value": 0 }], "previousStatement": null, "nextStatement": null, "colour": 180 },
        { "type": "oled_display", "message0": "OLED обновить экран", "previousStatement": null, "nextStatement": null, "colour": 180 },
        { "type": "oled_clear", "message0": "OLED очистить", "previousStatement": null, "nextStatement": null, "colour": 180 },
        { "type": "oled_pixel", "message0": "OLED точка (x %1, y %2) %3", "args0": [{ "type": "field_number", "name": "X", "value": 0 }, { "type": "field_number", "name": "Y", "value": 0 }, { "type": "field_dropdown", "name": "COLOR", "options": [["ЧЕРНЫЙ", "BLACK"], ["БЕЛЫЙ", "WHITE"]] }], "previousStatement": null, "nextStatement": null, "colour": 180 },
        { "type": "oled_line", "message0": "OLED линия (x1 %1, y1 %2) - (x2 %3, y2 %4) %5", "args0": [{ "type": "field_number", "name": "X1", "value": 0 }, { "type": "field_number", "name": "Y1", "value": 0 }, { "type": "field_number", "name": "X2", "value": 10 }, { "type": "field_number", "name": "Y2", "value": 10 }, { "type": "field_dropdown", "name": "COLOR", "options": [["ЧЕРНЫЙ", "BLACK"], ["БЕЛЫЙ", "WHITE"]] }], "previousStatement": null, "nextStatement": null, "colour": 180 },
        { "type": "oled_rect", "message0": "OLED прямоугольник (x %1, y %2, w %3, h %4) %5", "args0": [{ "type": "field_number", "name": "X", "value": 0 }, { "type": "field_number", "name": "Y", "value": 0 }, { "type": "field_number", "name": "W", "value": 20 }, { "type": "field_number", "name": "H", "value": 15 }, { "type": "field_dropdown", "name": "COLOR", "options": [["ЧЕРНЫЙ", "BLACK"], ["БЕЛЫЙ", "WHITE"]] }], "previousStatement": null, "nextStatement": null, "colour": 180 },
        { "type": "servo_attach", "message0": "серво пин %1", "args0": [{ "type": "field_number", "name": "PIN", "value": 2 }], "output": "Number", "colour": 260 },
        { "type": "servo_write", "message0": "серво %1 угол %2", "args0": [{ "type": "input_value", "name": "SERVO", "check": "Number" }, { "type": "field_number", "name": "ANGLE", "value": 90, "min": 0, "max": 180 }], "previousStatement": null, "nextStatement": null, "colour": 260 },
        { "type": "servo_read", "message0": "угол серво %1", "args0": [{ "type": "input_value", "name": "SERVO", "check": "Number" }], "output": "Number", "colour": 260 },
        { "type": "stepper_init", "message0": "шаговик пины IN1:%1 IN2:%2 IN3:%3 IN4:%4", "args0": [{ "type": "field_number", "name": "IN1", "value": 8 }, { "type": "field_number", "name": "IN2", "value": 9 }, { "type": "field_number", "name": "IN3", "value": 10 }, { "type": "field_number", "name": "IN4", "value": 11 }], "output": "Number", "colour": 240 },
        { "type": "stepper_step", "message0": "шаговик %1 шагов %2", "args0": [{ "type": "input_value", "name": "STEPPER", "check": "Number" }, { "type": "field_number", "name": "STEPS", "value": 10 }], "previousStatement": null, "nextStatement": null, "colour": 240 },
        { "type": "dht_sensor", "message0": "DHT датчик пин %1 тип %2", "args0": [{ "type": "field_number", "name": "PIN", "value": 4 }, { "type": "field_dropdown", "name": "TYPE", "options": [["DHT11", "DHT11"], ["DHT22", "DHT22"]] }], "output": "Array", "colour": 200 },
        { "type": "ds18b20_init", "message0": "DS18B20 иниц. пин %1", "args0": [{ "type": "field_number", "name": "PIN", "value": 4 }], "previousStatement": null, "nextStatement": null, "colour": 200 },
        { "type": "ds18b20_request", "message0": "DS18B20 запрос температуры", "previousStatement": null, "nextStatement": null, "colour": 200 },
        { "type": "ds18b20_read", "message0": "DS18B20 температура", "output": "Number", "colour": 200 },
        { "type": "wifi_connect", "message0": "WiFi подкл. SSID %1 пароль %2", "args0": [{ "type": "field_input", "name": "SSID", "text": "myNetwork" }, { "type": "field_input", "name": "PASSWORD", "text": "myPassword" }], "previousStatement": null, "nextStatement": null, "colour": 225 },
        { "type": "wifi_status", "message0": "WiFi статус", "output": "Boolean", "colour": 225 },
        { "type": "wifi_ip", "message0": "WiFi IP адрес", "output": "String", "colour": 225 },
        { "type": "http_request", "message0": "HTTP запрос %1 URL %2", "args0": [{ "type": "field_dropdown", "name": "METHOD", "options": [["GET", "GET"], ["POST", "POST"]] }, { "type": "field_input", "name": "URL", "text": "http://example.com" }], "output": "String", "colour": 225 },
        { "type": "mqtt_init", "message0": "MQTT иниц. сервер %1 порт %2", "args0": [{ "type": "field_input", "name": "SERVER", "text": "broker.hivemq.com" }, { "type": "field_number", "name": "PORT", "value": 1883 }], "previousStatement": null, "nextStatement": null, "colour": 225 },
        { "type": "mqtt_publish", "message0": "MQTT публ. топик %1 сообщение %2", "args0": [{ "type": "field_input", "name": "TOPIC", "text": "topic" }, { "type": "input_value", "name": "MESSAGE" }], "previousStatement": null, "nextStatement": null, "colour": 225 },
        { "type": "mqtt_subscribe", "message0": "MQTT подписка топик %1", "args0": [{ "type": "field_input", "name": "TOPIC", "text": "topic" }], "previousStatement": null, "nextStatement": null, "colour": 225 }
    ]);

    // 2. НАСТРОЙКА ГЕНЕРАТОРА (Arduino C++)
    Blockly.Arduino = new Blockly.Generator('Arduino');
    Blockly.Arduino.ORDER_ATOMIC = 0;
    Blockly.Arduino.ORDER_NONE = 99;

    Blockly.Arduino.init = function(workspace) {
        Blockly.Arduino.definitions_ = Object.create(null);
        Blockly.Arduino.setups_ = Object.create(null);
        Blockly.Arduino.libraries_ = Object.create(null);
        Blockly.Arduino.context_ = {
            servos: {},
            steppers: {},
            dht: {},
            ds18b20: {},
            counters: {
                servo: 0,
                stepper: 0,
                dht: 0,
                ds18b20: 0
            }
        };
        
        if (!Blockly.Arduino.nameDB_) {
            Blockly.Arduino.nameDB_ = new Blockly.Names(Blockly.Arduino.RESERVED_WORDS_);
        } else {
            Blockly.Arduino.nameDB_.reset();
        }
        // Исправление для v12+
        Blockly.Arduino.nameDB_.setVariableMap(workspace.getVariableMap());

        const defvars = [];
        const variables = workspace.getVariableMap().getAllVariables();
        for (let i = 0; i < variables.length; i++) {
            const varName = Blockly.Arduino.nameDB_.getName(variables[i].getId(), Blockly.Variables.NAME_TYPE);
            defvars.push(`float ${varName} = 0;`); 
        }
        if (defvars.length) Blockly.Arduino.definitions_['variables'] = defvars.join('\n');
    };

    Blockly.Arduino.scrub_ = function(block, code, opt_thisOnly) {
        const nextBlock = block.getNextBlock();
        const nextCode = (nextBlock && !opt_thisOnly) ? Blockly.Arduino.blockToCode(nextBlock) : '';
        return code + nextCode;
    };

    const normalizeKey = (value) => String(value).replace(/[^a-zA-Z0-9_]/g, '_');

    const ensureMqttHelpers = () => {
        Blockly.Arduino.libraries_['wifi'] = '#include <WiFi.h>';
        Blockly.Arduino.libraries_['mqtt'] = '#include <PubSubClient.h>';
        Blockly.Arduino.definitions_['mqtt_wifi_client'] = 'WiFiClient esp32MqttNetClient;';
        Blockly.Arduino.definitions_['mqtt_client'] = 'PubSubClient mqttClient(esp32MqttNetClient);';
        Blockly.Arduino.definitions_['mqtt_reconnect'] = `void ensureMqttConnection() {
  while (!mqttClient.connected()) {
    String clientId = "esp32-blockly-" + String((uint32_t)ESP.getEfuseMac(), HEX);
    if (mqttClient.connect(clientId.c_str())) {
      break;
    }
    delay(1000);
  }
}`;
    };

    const ensureDs18b20 = (pin) => {
        const key = String(pin);
        const ctx = Blockly.Arduino.context_;
        if (ctx.ds18b20[key] === undefined) {
            const idx = ctx.counters.ds18b20++;
            ctx.ds18b20[key] = idx;
            Blockly.Arduino.libraries_['onewire'] = '#include <OneWire.h>';
            Blockly.Arduino.libraries_['dallas'] = '#include <DallasTemperature.h>';
            Blockly.Arduino.definitions_[`onewire_${idx}`] = `OneWire oneWire_${idx}(${pin});`;
            Blockly.Arduino.definitions_[`ds18b20_${idx}`] = `DallasTemperature ds18b20_${idx}(&oneWire_${idx});`;
            Blockly.Arduino.setups_[`ds18b20_begin_${idx}`] = `ds18b20_${idx}.begin();`;
        }
        return ctx.ds18b20[key];
    };

    // --- БАЗОВЫЕ ГЕНЕРАТОРЫ ДЛЯ СТАНДАРТНЫХ БЛОКОВ ---
    const binaryOperators = {
        'EQ': '==',
        'NEQ': '!=',
        'LT': '<',
        'LTE': '<=',
        'GT': '>',
        'GTE': '>='
    };

    Blockly.Arduino.forBlock['logic_boolean'] = function(block) {
        return [block.getFieldValue('BOOL') === 'TRUE' ? 'true' : 'false', Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.forBlock['logic_compare'] = function(block, generator) {
        const op = binaryOperators[block.getFieldValue('OP')] || '==';
        const left = generator.valueToCode(block, 'A', Blockly.Arduino.ORDER_NONE) || '0';
        const right = generator.valueToCode(block, 'B', Blockly.Arduino.ORDER_NONE) || '0';
        return [`(${left} ${op} ${right})`, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.forBlock['logic_operation'] = function(block, generator) {
        const op = block.getFieldValue('OP') === 'AND' ? '&&' : '||';
        const left = generator.valueToCode(block, 'A', Blockly.Arduino.ORDER_NONE) || 'false';
        const right = generator.valueToCode(block, 'B', Blockly.Arduino.ORDER_NONE) || 'false';
        return [`(${left} ${op} ${right})`, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.forBlock['logic_negate'] = function(block, generator) {
        const value = generator.valueToCode(block, 'BOOL', Blockly.Arduino.ORDER_NONE) || 'false';
        return [`(!${value})`, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.forBlock['math_number'] = function(block) {
        return [String(block.getFieldValue('NUM')), Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.forBlock['math_arithmetic'] = function(block, generator) {
        const operatorMap = { ADD: '+', MINUS: '-', MULTIPLY: '*', DIVIDE: '/' };
        const op = operatorMap[block.getFieldValue('OP')] || '+';
        const left = generator.valueToCode(block, 'A', Blockly.Arduino.ORDER_NONE) || '0';
        const right = generator.valueToCode(block, 'B', Blockly.Arduino.ORDER_NONE) || '0';
        return [`(${left} ${op} ${right})`, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.forBlock['math_single'] = function(block, generator) {
        const operator = block.getFieldValue('OP');
        const value = generator.valueToCode(block, 'NUM', Blockly.Arduino.ORDER_NONE) || '0';
        const map = {
            ROOT: `sqrt(${value})`,
            ABS: `abs(${value})`,
            NEG: `(-${value})`,
            LN: `log(${value})`,
            LOG10: `log10(${value})`,
            EXP: `exp(${value})`,
            POW10: `pow(10, ${value})`
        };
        return [map[operator] || value, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.forBlock['math_random_int'] = function(block, generator) {
        const from = generator.valueToCode(block, 'FROM', Blockly.Arduino.ORDER_NONE) || '0';
        const to = generator.valueToCode(block, 'TO', Blockly.Arduino.ORDER_NONE) || '0';
        return [`random(${from}, (${to}) + 1)`, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.forBlock['variables_get'] = function(block) {
        const name = Blockly.Arduino.nameDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
        return [name, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.forBlock['variables_set'] = function(block, generator) {
        const name = Blockly.Arduino.nameDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
        const value = generator.valueToCode(block, 'VALUE', Blockly.Arduino.ORDER_NONE) || '0';
        return `${name} = ${value};\n`;
    };

    Blockly.Arduino.forBlock['text'] = function(block) {
        const value = JSON.stringify(block.getFieldValue('TEXT') || '');
        return [value, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.forBlock['text_join'] = function(block, generator) {
        const itemCount = block.itemCount_ || 0;
        const values = [];
        for (let i = 0; i < itemCount; i += 1) {
            const part = generator.valueToCode(block, `ADD${i}`, Blockly.Arduino.ORDER_NONE) || '""';
            values.push(`String(${part})`);
        }
        return [values.length ? values.join(' + ') : '""', Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.forBlock['text_length'] = function(block, generator) {
        const value = generator.valueToCode(block, 'VALUE', Blockly.Arduino.ORDER_NONE) || '""';
        return [`String(${value}).length()`, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.forBlock['text_isEmpty'] = function(block, generator) {
        const value = generator.valueToCode(block, 'VALUE', Blockly.Arduino.ORDER_NONE) || '""';
        return [`String(${value}).length() == 0`, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.forBlock['controls_if'] = function(block, generator) {
        let n = 0;
        let code = '';
        do {
            const condition = generator.valueToCode(block, `IF${n}`, Blockly.Arduino.ORDER_NONE) || 'false';
            const branch = generator.statementToCode(block, `DO${n}`);
            code += `${n === 0 ? 'if' : 'else if'} (${condition}) {\n${branch}}`;
            n += 1;
        } while (block.getInput(`IF${n}`));

        if (block.getInput('ELSE')) {
            code += ` else {\n${generator.statementToCode(block, 'ELSE')}}`;
        }

        return `${code}\n`;
    };

    Blockly.Arduino.forBlock['controls_repeat_ext'] = function(block, generator) {
        const repeats = generator.valueToCode(block, 'TIMES', Blockly.Arduino.ORDER_NONE) || '0';
        const branch = generator.statementToCode(block, 'DO');
        const loopVar = Blockly.Arduino.nameDB_.getDistinctName('count', Blockly.Variables.NAME_TYPE);
        return `for (int ${loopVar} = 0; ${loopVar} < ${repeats}; ${loopVar}++) {\n${branch}}\n`;
    };

    Blockly.Arduino.forBlock['controls_whileUntil'] = function(block, generator) {
        let condition = generator.valueToCode(block, 'BOOL', Blockly.Arduino.ORDER_NONE) || 'false';
        if (block.getFieldValue('MODE') === 'UNTIL') {
            condition = `!(${condition})`;
        }
        const branch = generator.statementToCode(block, 'DO');
        return `while (${condition}) {\n${branch}}\n`;
    };

    Blockly.Arduino.forBlock['controls_for'] = function(block, generator) {
        const name = Blockly.Arduino.nameDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
        const from = generator.valueToCode(block, 'FROM', Blockly.Arduino.ORDER_NONE) || '0';
        const to = generator.valueToCode(block, 'TO', Blockly.Arduino.ORDER_NONE) || '0';
        const by = generator.valueToCode(block, 'BY', Blockly.Arduino.ORDER_NONE) || '1';
        const branch = generator.statementToCode(block, 'DO');
        return `for (int ${name} = ${from}; ${name} <= ${to}; ${name} += ${by}) {\n${branch}}\n`;
    };

// 3. ГЕНЕРАТОРЫ ESP32 (ИЗ ВАШЕГО ИСХОДНИКА)
    Blockly.Arduino.forBlock['esp32_pin_mode'] = function(block) {
        const pin = block.getFieldValue('PIN');
        Blockly.Arduino.setups_['pin_mode_' + pin] = `pinMode(${pin}, ${block.getFieldValue('MODE')});`;
        return '';
    };

    Blockly.Arduino.forBlock['esp32_digital_write'] = function(block) {
        return `digitalWrite(${block.getFieldValue('PIN')}, ${block.getFieldValue('STATE')});\n`;
    };

    Blockly.Arduino.forBlock['esp32_digital_read'] = function(block) {
        return [`digitalRead(${block.getFieldValue('PIN')})`, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.forBlock['esp32_analog_read'] = function(block) {
        return [`analogRead(${block.getFieldValue('PIN')})`, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.forBlock['esp32_pwm_write'] = function(block, generator) {
        const val = generator.valueToCode(block, 'VAL', Blockly.Arduino.ORDER_NONE) || '0';
        return `analogWrite(${block.getFieldValue('PIN')}, ${val});\n`;
    };

    Blockly.Arduino.forBlock['esp32_delay'] = function(block, generator) {
        const ms = generator.valueToCode(block, 'MS', Blockly.Arduino.ORDER_NONE) || '0';
        return `delay(${ms});\n`;
    };

    Blockly.Arduino.forBlock['esp32_millis'] = function() { return ['millis()', Blockly.Arduino.ORDER_ATOMIC]; };
    Blockly.Arduino.forBlock['esp32_micros'] = function() { return ['micros()', Blockly.Arduino.ORDER_ATOMIC]; };
    Blockly.Arduino.forBlock['esp32_delaymicroseconds'] = function(block, generator) {
        const us = generator.valueToCode(block, 'US', Blockly.Arduino.ORDER_NONE) || '0';
        return `delayMicroseconds(${us});\n`;
    };
    Blockly.Arduino.forBlock['esp32_pwm_freq'] = function(block, generator) {
        const freq = generator.valueToCode(block, 'FREQ', Blockly.Arduino.ORDER_NONE) || '5000';
        const channel = block.getFieldValue('CHANNEL');
        Blockly.Arduino.setups_[`pwm_setup_${channel}`] = `ledcSetup(${channel}, ${freq}, 8);`;
        return '';
    };
    Blockly.Arduino.forBlock['esp32_adc_width'] = function(block) {
        return `analogReadResolution(${block.getFieldValue('WIDTH')});\n`;
    };

    Blockly.Arduino.forBlock['esp32_serial_init'] = function(block) {
        Blockly.Arduino.setups_['serial_init'] = `Serial.begin(${block.getFieldValue('BAUD')});`;
        return '';
    };

    Blockly.Arduino.forBlock['esp32_serial_print'] = function(block, generator) {
        const msg = generator.valueToCode(block, 'MSG', Blockly.Arduino.ORDER_NONE) || '""';
        return `Serial.${block.getFieldValue('NL') === 'TRUE' ? 'println' : 'print'}(${msg});\n`;
    };

    Blockly.Arduino.forBlock['esp32_serial_available'] = function() { return ['Serial.available() > 0', Blockly.Arduino.ORDER_ATOMIC]; };
    Blockly.Arduino.forBlock['esp32_serial_println'] = function(block, generator) {
        const msg = generator.valueToCode(block, 'MSG', Blockly.Arduino.ORDER_NONE) || '""';
        return `Serial.println(${msg});\n`;
    };
    Blockly.Arduino.forBlock['esp32_serial_read'] = function() { return ['Serial.read()', Blockly.Arduino.ORDER_ATOMIC]; };
    Blockly.Arduino.forBlock['esp32_serial_peek'] = function() { return ['Serial.peek()', Blockly.Arduino.ORDER_ATOMIC]; };
    Blockly.Arduino.forBlock['esp32_serial_flush'] = function() { return `Serial.flush();\n`; };

    Blockly.Arduino.forBlock['esp32_interrupt'] = function(block, generator) {
        const pin = block.getFieldValue('PIN');
        const branch = generator.statementToCode(block, 'DO');
        const funcName = `ISR_Pin_${pin}`;
        Blockly.Arduino.definitions_[`isr_${pin}`] = `void IRAM_ATTR ${funcName}() {\n${branch}\n}`;
        Blockly.Arduino.setups_[`attach_isr_${pin}`] = `pinMode(${pin}, INPUT_PULLUP);\n  attachInterrupt(digitalPinToInterrupt(${pin}), ${funcName}, ${block.getFieldValue('MODE')});`;
        return '';
    };
    Blockly.Arduino.forBlock['esp32_detach_interrupt'] = function(block) {
        return `detachInterrupt(digitalPinToInterrupt(${block.getFieldValue('PIN')}));\n`;
    };

    Blockly.Arduino.forBlock['lcd_i2c_init'] = function(block) {
        Blockly.Arduino.libraries_['wire'] = '#include <Wire.h>';
        Blockly.Arduino.libraries_['lcd'] = '#include <LiquidCrystal_I2C.h>';
        Blockly.Arduino.definitions_['lcd_obj'] = `LiquidCrystal_I2C lcd(0x${block.getFieldValue('ADDR')}, ${block.getFieldValue('COLS')}, ${block.getFieldValue('ROWS')});`;
        Blockly.Arduino.setups_['lcd_init'] = `lcd.init();\n  lcd.backlight();`;
        return '';
    };

    Blockly.Arduino.forBlock['lcd_i2c_print'] = function(block, generator) {
        const text = generator.valueToCode(block, 'TEXT', Blockly.Arduino.ORDER_NONE) || '""';
        return `lcd.setCursor(${block.getFieldValue('COL')}, ${block.getFieldValue('ROW')});\nlcd.print(${text});\n`;
    };

    Blockly.Arduino.forBlock['lcd_i2c_clear'] = function() { return `lcd.clear();\n`; };
    Blockly.Arduino.forBlock['lcd_i2c_cursor'] = function(block) {
        return `lcd.setCursor(${block.getFieldValue('COL')}, ${block.getFieldValue('ROW')});\n`;
    };
    Blockly.Arduino.forBlock['lcd_i2c_backlight'] = function(block) {
        return `lcd.${block.getFieldValue('STATE') === 'ON' ? 'backlight' : 'noBacklight'}();\n`;
    };

    Blockly.Arduino.forBlock['oled_init'] = function() {
        Blockly.Arduino.libraries_['wire'] = '#include <Wire.h>';
        Blockly.Arduino.libraries_['gfx'] = '#include <Adafruit_GFX.h>';
        Blockly.Arduino.libraries_['ssd1306'] = '#include <Adafruit_SSD1306.h>';
        Blockly.Arduino.definitions_['oled_obj'] = `Adafruit_SSD1306 display(128, 64, &Wire, -1);`;
        Blockly.Arduino.setups_['oled_init'] = `if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { Serial.println(F("SSD1306 fail")); }\ndisplay.clearDisplay();\ndisplay.setTextColor(WHITE);\ndisplay.display();`;
        return '';
    };

    Blockly.Arduino.forBlock['oled_print'] = function(block, generator) {
        const text = generator.valueToCode(block, 'TEXT', Blockly.Arduino.ORDER_NONE) || '""';
        return `display.setTextSize(${block.getFieldValue('SIZE')});\ndisplay.setCursor(${block.getFieldValue('X')}, ${block.getFieldValue('Y')});\ndisplay.print(${text});\n`;
    };

    Blockly.Arduino.forBlock['oled_display'] = function() { return `display.display();\n`; };
    Blockly.Arduino.forBlock['oled_clear'] = function() { return `display.clearDisplay();\n`; };
    Blockly.Arduino.forBlock['oled_pixel'] = function(block) {
        return `display.drawPixel(${block.getFieldValue('X')}, ${block.getFieldValue('Y')}, ${block.getFieldValue('COLOR')});\n`;
    };
    Blockly.Arduino.forBlock['oled_line'] = function(block) {
        return `display.drawLine(${block.getFieldValue('X1')}, ${block.getFieldValue('Y1')}, ${block.getFieldValue('X2')}, ${block.getFieldValue('Y2')}, ${block.getFieldValue('COLOR')});\n`;
    };
    Blockly.Arduino.forBlock['oled_rect'] = function(block) {
        return `display.drawRect(${block.getFieldValue('X')}, ${block.getFieldValue('Y')}, ${block.getFieldValue('W')}, ${block.getFieldValue('H')}, ${block.getFieldValue('COLOR')});\n`;
    };


    Blockly.Arduino.forBlock['servo_attach'] = function(block) {
        const pin = block.getFieldValue('PIN');
        const key = String(pin);
        const ctx = Blockly.Arduino.context_;
        if (ctx.servos[key] === undefined) {
            const idx = ctx.counters.servo++;
            ctx.servos[key] = idx;
            Blockly.Arduino.libraries_['servo'] = '#include <ESP32Servo.h>';
            Blockly.Arduino.definitions_[`servo_obj_${idx}`] = `Servo servo_${idx};`;
            Blockly.Arduino.setups_[`servo_attach_${idx}`] = `servo_${idx}.attach(${pin});`;
        }
        return [String(ctx.servos[key]), Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.forBlock['servo_write'] = function(block, generator) {
        const servoId = generator.valueToCode(block, 'SERVO', Blockly.Arduino.ORDER_NONE) || '0';
        const angle = block.getFieldValue('ANGLE');
        return `servo_${servoId}.write(${angle});
`;
    };

    Blockly.Arduino.forBlock['servo_read'] = function(block, generator) {
        const servoId = generator.valueToCode(block, 'SERVO', Blockly.Arduino.ORDER_NONE) || '0';
        return [`servo_${servoId}.read()`, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.forBlock['stepper_init'] = function(block) {
        const in1 = block.getFieldValue('IN1');
        const in2 = block.getFieldValue('IN2');
        const in3 = block.getFieldValue('IN3');
        const in4 = block.getFieldValue('IN4');
        const key = `${in1}_${in2}_${in3}_${in4}`;
        const ctx = Blockly.Arduino.context_;

        if (ctx.steppers[key] === undefined) {
            const idx = ctx.counters.stepper++;
            ctx.steppers[key] = idx;
            Blockly.Arduino.libraries_['stepper'] = '#include <Stepper.h>';
            Blockly.Arduino.definitions_[`stepper_obj_${idx}`] = `Stepper stepper_${idx}(2048, ${in1}, ${in3}, ${in2}, ${in4});`;
            Blockly.Arduino.setups_[`stepper_speed_${idx}`] = `stepper_${idx}.setSpeed(10);`;
        }

        return [String(ctx.steppers[key]), Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.forBlock['stepper_step'] = function(block, generator) {
        const stepperId = generator.valueToCode(block, 'STEPPER', Blockly.Arduino.ORDER_NONE) || '0';
        const steps = block.getFieldValue('STEPS');
        return `stepper_${stepperId}.step(${steps});
`;
    };

    Blockly.Arduino.forBlock['dht_sensor'] = function(block) {
        const pin = block.getFieldValue('PIN');
        const type = block.getFieldValue('TYPE');
        const key = `${pin}_${type}`;
        const ctx = Blockly.Arduino.context_;

        if (ctx.dht[key] === undefined) {
            const idx = ctx.counters.dht++;
            ctx.dht[key] = idx;
            Blockly.Arduino.libraries_['dht'] = '#include <DHT.h>';
            Blockly.Arduino.definitions_[`dht_type_${idx}`] = `#define DHT_TYPE_${idx} ${type}`;
            Blockly.Arduino.definitions_[`dht_obj_${idx}`] = `DHT dht_${idx}(${pin}, DHT_TYPE_${idx});`;
            Blockly.Arduino.setups_[`dht_begin_${idx}`] = `dht_${idx}.begin();`;
        }

        const idx = ctx.dht[key];
        return [`(String(dht_${idx}.readTemperature()) + "," + String(dht_${idx}.readHumidity()))`, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.forBlock['ds18b20_init'] = function(block) {
        ensureDs18b20(block.getFieldValue('PIN'));
        return '';
    };

    Blockly.Arduino.forBlock['ds18b20_request'] = function() {
        const firstSensor = Object.values(Blockly.Arduino.context_.ds18b20)[0];
        if (typeof firstSensor !== 'number') {
            ensureDs18b20(4);
        }
        const idx = Object.values(Blockly.Arduino.context_.ds18b20)[0];
        return `ds18b20_${idx}.requestTemperatures();
`;
    };

    Blockly.Arduino.forBlock['ds18b20_read'] = function() {
        const firstSensor = Object.values(Blockly.Arduino.context_.ds18b20)[0];
        if (typeof firstSensor !== 'number') {
            ensureDs18b20(4);
        }
        const idx = Object.values(Blockly.Arduino.context_.ds18b20)[0];
        return [`ds18b20_${idx}.getTempCByIndex(0)`, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.forBlock['wifi_connect'] = function(block) {
        const ssid = JSON.stringify(block.getFieldValue('SSID'));
        const password = JSON.stringify(block.getFieldValue('PASSWORD'));
        Blockly.Arduino.libraries_['wifi'] = '#include <WiFi.h>';
        return `WiFi.mode(WIFI_STA);
WiFi.begin(${ssid}, ${password});
while (WiFi.status() != WL_CONNECTED) {
  delay(500);
}
`;
    };

    Blockly.Arduino.forBlock['wifi_status'] = function() {
        Blockly.Arduino.libraries_['wifi'] = '#include <WiFi.h>';
        return ['WiFi.status() == WL_CONNECTED', Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.forBlock['wifi_ip'] = function() {
        Blockly.Arduino.libraries_['wifi'] = '#include <WiFi.h>';
        return ['WiFi.localIP().toString()', Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.forBlock['http_request'] = function(block) {
        const method = block.getFieldValue('METHOD');
        const url = JSON.stringify(block.getFieldValue('URL'));
        Blockly.Arduino.libraries_['wifi'] = '#include <WiFi.h>';
        Blockly.Arduino.libraries_['http'] = '#include <HTTPClient.h>';
        Blockly.Arduino.definitions_['http_helper'] = `String blocklyHttpRequest(const String& method, const String& url) {
  HTTPClient http;
  http.begin(url);
  int code = method == "POST" ? http.POST("") : http.GET();
  String payload = code > 0 ? http.getString() : String("");
  http.end();
  return payload;
}`;
        return [`blocklyHttpRequest(${JSON.stringify(method)}, ${url})`, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.forBlock['mqtt_init'] = function(block) {
        const server = JSON.stringify(block.getFieldValue('SERVER'));
        const port = block.getFieldValue('PORT');
        ensureMqttHelpers();
        Blockly.Arduino.setups_['mqtt_server'] = `mqttClient.setServer(${server}, ${port});`;
        return '';
    };

    Blockly.Arduino.forBlock['mqtt_publish'] = function(block, generator) {
        const topic = JSON.stringify(block.getFieldValue('TOPIC'));
        const message = generator.valueToCode(block, 'MESSAGE', Blockly.Arduino.ORDER_NONE) || '""';
        ensureMqttHelpers();
        return `ensureMqttConnection();
mqttClient.publish(${topic}, String(${message}).c_str());
mqttClient.loop();
`;
    };

    Blockly.Arduino.forBlock['mqtt_subscribe'] = function(block) {
        const topic = block.getFieldValue('TOPIC');
        const topicLiteral = JSON.stringify(topic);
        ensureMqttHelpers();
        Blockly.Arduino.setups_[`mqtt_sub_${normalizeKey(topic)}`] = `mqttClient.subscribe(${topicLiteral});`;
        return `ensureMqttConnection();\nmqttClient.loop();\n`;
    };

    // 4. ЗАПУСК И ГЛОБАЛЬНЫЕ ФУНКЦИИ (ДЛЯ КНОПОК HTML)
    window.workspace = Blockly.inject(blocklyDiv, {
        toolbox: getToolboxConfig(),
        media: 'https://unpkg.com/blockly/media/',
        grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
        trashcan: true
    });

    window.workspace.addChangeListener((e) => {
        if (e.isUiEvent) return;
        saveState();
        generateFullCode();
    });

    loadState();
    
    // Экспорт функций для HTML-кнопок
    window.generateCode = generateFullCode;
    
    // Функция компиляции проекта
    window.compileProject = async function() {
        try {
            const code = generateFullCode();
            
            // Отправляем код на сервер для компиляции
            const response = await fetch('/api/compile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code: code,
                    options: {
                        delay: Number(document.getElementById('loopDelay')?.value || 10)
                    }
                })
            });
            
            const result = await response.json().catch(() => null);
            if (!response.ok) {
                const serverError = result?.error || result?.details || response.statusText;
                throw new Error(`Ошибка компиляции: ${serverError}`);
            }
            
            if (result.success) {
                console.log('Компиляция успешна:', result.message);
                alert(result.message);
            } else {
                console.error('Ошибка компиляции:', result.error);
                alert(`Ошибка компиляции: ${result.error}`);
            }
        } catch (error) {
            console.error('Ошибка при компиляции:', error);
            alert(`Ошибка: ${error.message}`);
        }
    };
});

function saveState() {
    const state = Blockly.serialization.workspaces.save(window.workspace);
    localStorage.setItem('blockly_workspace', JSON.stringify(state));
}

function loadState() {
    try {
        const saved = localStorage.getItem('blockly_workspace');
        if (saved) Blockly.serialization.workspaces.load(JSON.parse(saved), window.workspace);
    } catch(e) {}
}

function generateFullCode() {
    try {
        Blockly.Arduino.init(window.workspace);
        const code = Blockly.Arduino.workspaceToCode(window.workspace);
        const libs = Object.values(Blockly.Arduino.libraries_ || {}).join('\n');
        const defs = Object.values(Blockly.Arduino.definitions_ || {}).join('\n');
        const setups = Object.values(Blockly.Arduino.setups_ || {}).join('\n  ');

        const fullCode = `/* Сгенерировано ESP32 Blockly */\n#include <Arduino.h>\n${libs}\n\n${defs}\n\nvoid setup() {\n  ${setups}\n}\n\nvoid loop() {\n${code}\n  delay(1);\n}`;
        if (window.codeViewer) window.codeViewer.setCode(fullCode, 'cpp');
        return fullCode;
    } catch (e) { return "// Ошибка: " + e.message; }
}

// 5. ТУЛБОКС - ВКЛЮЧАЕТ ВСЕ КАТЕГОРИИ И СТРОКИ
function getToolboxConfig() {
    return {
        'kind': 'categoryToolbox',
        'contents': [
            { 'kind': 'category', 'name': 'Логика', 'colour': '210', 'contents': [{ 'kind': 'block', 'type': 'controls_if' }, { 'kind': 'block', 'type': 'logic_compare' }, { 'kind': 'block', 'type': 'logic_operation' }, { 'kind': 'block', 'type': 'logic_negate' }, { 'kind': 'block', 'type': 'logic_boolean' }] },
            { 'kind': 'category', 'name': 'Циклы', 'colour': '120', 'contents': [{ 'kind': 'block', 'type': 'controls_repeat_ext' }, { 'kind': 'block', 'type': 'controls_whileUntil' }, { 'kind': 'block', 'type': 'controls_for' }] },
            { 'kind': 'category', 'name': 'Математика', 'colour': '230', 'contents': [{ 'kind': 'block', 'type': 'math_number' }, { 'kind': 'block', 'type': 'math_arithmetic' }, { 'kind': 'block', 'type': 'math_single' }, { 'kind': 'block', 'type': 'math_random_int' }] },
            { 
                'kind': 'category', 'name': 'Текст', 'colour': '160', 
                'contents': [
                    { 'kind': 'block', 'type': 'text' }, 
                    { 'kind': 'block', 'type': 'text_join' },
                    { 'kind': 'block', 'type': 'text_length' },
                    { 'kind': 'block', 'type': 'text_isEmpty' }
                ] 
            },
            { 'kind': 'category', 'name': 'Переменные', 'custom': 'VARIABLE', 'colour': '330' },
            { 'kind': 'category', 'name': 'Функции', 'custom': 'PROCEDURE', 'colour': '290' },
            { 'kind': 'sep' },
            { 'kind': 'category', 'name': 'Входы/Выходы', 'colour': '160', 'contents': [{ 'kind': 'block', 'type': 'esp32_pin_mode' }, { 'kind': 'block', 'type': 'esp32_digital_write' }, { 'kind': 'block', 'type': 'esp32_digital_read' }, { 'kind': 'block', 'type': 'esp32_pwm_write' }, { 'kind': 'block', 'type': 'esp32_pwm_freq' }, { 'kind': 'block', 'type': 'esp32_analog_read' }, { 'kind': 'block', 'type': 'esp32_adc_width' }] },
            { 'kind': 'category', 'name': 'Время', 'colour': '65', 'contents': [{ 'kind': 'block', 'type': 'esp32_delay' }, { 'kind': 'block', 'type': 'esp32_delaymicroseconds' }, { 'kind': 'block', 'type': 'esp32_millis' }, { 'kind': 'block', 'type': 'esp32_micros' }] },
            { 'kind': 'category', 'name': 'Монитор порта', 'colour': '20', 'contents': [{ 'kind': 'block', 'type': 'esp32_serial_init' }, { 'kind': 'block', 'type': 'esp32_serial_print' }, { 'kind': 'block', 'type': 'esp32_serial_println' }, { 'kind': 'block', 'type': 'esp32_serial_available' }, { 'kind': 'block', 'type': 'esp32_serial_read' }, { 'kind': 'block', 'type': 'esp32_serial_peek' }, { 'kind': 'block', 'type': 'esp32_serial_flush' }] },
            { 'kind': 'category', 'name': 'Дисплей LCD', 'colour': '190', 'contents': [{ 'kind': 'block', 'type': 'lcd_i2c_init' }, { 'kind': 'block', 'type': 'lcd_i2c_print' }, { 'kind': 'block', 'type': 'lcd_i2c_clear' }, { 'kind': 'block', 'type': 'lcd_i2c_cursor' }, { 'kind': 'block', 'type': 'lcd_i2c_backlight' }] },
            { 'kind': 'category', 'name': 'Дисплей OLED', 'colour': '180', 'contents': [{ 'kind': 'block', 'type': 'oled_init' }, { 'kind': 'block', 'type': 'oled_print' }, { 'kind': 'block', 'type': 'oled_display' }, { 'kind': 'block', 'type': 'oled_clear' }, { 'kind': 'block', 'type': 'oled_pixel' }, { 'kind': 'block', 'type': 'oled_line' }, { 'kind': 'block', 'type': 'oled_rect' }] },
            { 'kind': 'category', 'name': 'Датчики', 'colour': '200', 'contents': [{ 'kind': 'block', 'type': 'dht_sensor' }, { 'kind': 'block', 'type': 'ds18b20_init' }, { 'kind': 'block', 'type': 'ds18b20_request' }, { 'kind': 'block', 'type': 'ds18b20_read' }] },
            { 'kind': 'category', 'name': 'Моторы', 'colour': '260', 'contents': [{ 'kind': 'block', 'type': 'servo_attach' }, { 'kind': 'block', 'type': 'servo_write' }, { 'kind': 'block', 'type': 'servo_read' }, { 'kind': 'block', 'type': 'stepper_init' }, { 'kind': 'block', 'type': 'stepper_step' }] },
            { 'kind': 'category', 'name': 'Сеть', 'colour': '225', 'contents': [{ 'kind': 'block', 'type': 'wifi_connect' }, { 'kind': 'block', 'type': 'wifi_status' }, { 'kind': 'block', 'type': 'wifi_ip' }, { 'kind': 'block', 'type': 'http_request' }, { 'kind': 'block', 'type': 'mqtt_init' }, { 'kind': 'block', 'type': 'mqtt_publish' }, { 'kind': 'block', 'type': 'mqtt_subscribe' }] },
            { 'kind': 'category', 'name': 'Прерывания', 'colour': '290', 'contents': [{ 'kind': 'block', 'type': 'esp32_interrupt' }, { 'kind': 'block', 'type': 'esp32_detach_interrupt' }] }
        ]
    };
}
