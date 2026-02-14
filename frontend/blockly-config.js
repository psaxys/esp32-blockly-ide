// ПОЛНАЯ КОНФИГУРАЦИЯ BLOCKLY ДЛЯ ESP32 (V2.0)
// Включает: Логику, Циклы, I/O, Дисплеи, Прерывания, Массивы и др.

document.addEventListener('DOMContentLoaded', function() {
    if (window.workspace) return; // Защита от двойной инициализации

    const blocklyDiv = document.getElementById('blocklyDiv');
    if (!blocklyDiv) return;

    // =================================================================
    // 1. ОПРЕДЕЛЕНИЕ ВИЗУАЛЬНЫХ БЛОКОВ (JSON)
    // =================================================================
    Blockly.defineBlocksWithJsonArray([
        // --- ВРЕМЯ ---
        {
            "type": "esp32_delay",
            "message0": "ждать %1 мс",
            "args0": [{ "type": "input_value", "name": "MS", "check": "Number" }],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 65,
            "tooltip": "Задержка выполнения (delay)"
        },
        {
            "type": "esp32_millis",
            "message0": "время с старта (мс)",
            "output": "Number",
            "colour": 65,
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
            "previousStatement": null,
            "nextStatement": null,
            "colour": 160
        },
        {
            "type": "esp32_digital_write",
            "message0": "цифровой пин %1 установить %2",
            "args0": [
                { "type": "field_number", "name": "PIN", "value": 2 },
                { "type": "field_dropdown", "name": "STATE", "options": [["HIGH", "HIGH"], ["LOW", "LOW"]] }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 160
        },
        {
            "type": "esp32_digital_read",
            "message0": "читать цифровой пин %1",
            "args0": [{ "type": "field_number", "name": "PIN", "value": 0 }],
            "output": "Number",
            "colour": 160
        },
        {
            "type": "esp32_analog_read",
            "message0": "читать аналоговый пин %1",
            "args0": [{ "type": "field_number", "name": "PIN", "value": 34 }],
            "output": "Number",
            "colour": 160
        },
        {
            "type": "esp32_pwm_write",
            "message0": "ШИМ (Analog) пин %1 знач %2",
            "args0": [
                { "type": "field_number", "name": "PIN", "value": 2 },
                { "type": "input_value", "name": "VAL", "check": "Number" }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 160
        },

        // --- МОНИТОР ПОРТА (SERIAL) ---
        {
            "type": "esp32_serial_init",
            "message0": "Serial скорость %1",
            "args0": [{ "type": "field_number", "name": "BAUD", "value": 115200 }],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 20
        },
        {
            "type": "esp32_serial_print",
            "message0": "Serial печать %1 (новая строка: %2)",
            "args0": [
                { "type": "input_value", "name": "MSG" },
                { "type": "field_checkbox", "name": "NL", "checked": true }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 20
        },
        {
            "type": "esp32_serial_available",
            "message0": "Serial данные доступны?",
            "output": "Boolean",
            "colour": 20
        },

        // --- ПРЕРЫВАНИЯ ---
        {
            "type": "esp32_interrupt",
            "message0": "Прерывание на пине %1 режим %2 %3 выполнять %4",
            "args0": [
                { "type": "field_number", "name": "PIN", "value": 0 },
                { "type": "field_dropdown", "name": "MODE", "options": [["ИЗМЕНЕНИЕ (CHANGE)", "CHANGE"], ["РОСТ (RISING)", "RISING"], ["СПАД (FALLING)", "FALLING"]] },
                { "type": "input_dummy" },
                { "type": "input_statement", "name": "DO" }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 290,
            "tooltip": "Выполняет код при срабатывании прерывания"
        },

        // --- LCD ДИСПЛЕЙ (I2C) ---
        {
            "type": "lcd_i2c_init",
            "message0": "LCD I2C иниц. адрес 0x%1 колог %2 строк %3",
            "args0": [
                { "type": "field_input", "name": "ADDR", "text": "27" },
                { "type": "field_number", "name": "COLS", "value": 16 },
                { "type": "field_number", "name": "ROWS", "value": 2 }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 190
        },
        {
            "type": "lcd_i2c_print",
            "message0": "LCD печать %1 на стр %2 поз %3",
            "args0": [
                { "type": "input_value", "name": "TEXT" },
                { "type": "field_number", "name": "ROW", "value": 0 },
                { "type": "field_number", "name": "COL", "value": 0 }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 190
        },
        {
            "type": "lcd_i2c_clear",
            "message0": "LCD очистить",
            "previousStatement": null,
            "nextStatement": null,
            "colour": 190
        },

        // --- OLED ДИСПЛЕЙ (SSD1306) ---
        {
            "type": "oled_init",
            "message0": "OLED иниц. (128x64 I2C)",
            "previousStatement": null,
            "nextStatement": null,
            "colour": 180
        },
        {
            "type": "oled_print",
            "message0": "OLED текст %1 размер %2 x %3 y %4",
            "args0": [
                { "type": "input_value", "name": "TEXT" },
                { "type": "field_number", "name": "SIZE", "value": 1 },
                { "type": "field_number", "name": "X", "value": 0 },
                { "type": "field_number", "name": "Y", "value": 0 }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 180
        },
        {
            "type": "oled_display",
            "message0": "OLED обновить экран",
            "previousStatement": null,
            "nextStatement": null,
            "colour": 180
        },
        {
            "type": "oled_clear",
            "message0": "OLED очистить",
            "previousStatement": null,
            "nextStatement": null,
            "colour": 180
        }
    ]);

    // =================================================================
    // 2. НАСТРОЙКА ГЕНЕРАТОРА (Arduino C++)
    // =================================================================
    Blockly.Arduino = new Blockly.Generator('Arduino');
    Blockly.Arduino.ORDER_ATOMIC = 0;
    Blockly.Arduino.ORDER_NONE = 99;

    // Инициализация базы имен и списков (Критически важно для переменных!)
    Blockly.Arduino.init = function(workspace) {
        Blockly.Arduino.definitions_ = Object.create(null);
        Blockly.Arduino.setups_ = Object.create(null);
        Blockly.Arduino.libraries_ = Object.create(null);
        
        // Исправление для работы переменных
        if (!Blockly.Arduino.nameDB_) {
            Blockly.Arduino.nameDB_ = new Blockly.Names(Blockly.Arduino.RESERVED_WORDS_);
        } else {
            Blockly.Arduino.nameDB_.reset();
        }
        Blockly.Arduino.nameDB_.setVariableMap(workspace.getVariableMap());

        // Глобальное объявление переменных
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

    // КОПИРОВАНИЕ ЛОГИКИ СТАНДАРТНЫХ БЛОКОВ ИЗ JAVASCRIPT
    if (Blockly.JavaScript) {
        const standardBlocks = [
            'controls_if', 'controls_repeat_ext', 'controls_whileUntil', 'controls_for',
            'logic_compare', 'logic_operation', 'logic_negate', 'logic_boolean', 'logic_null', 'logic_ternary',
            'math_number', 'math_arithmetic', 'math_single', 'math_trig', 'math_constant', 'math_number_property', 'math_round', 'math_modulo', 'math_constrain', 'math_random_int',
            'text', 'text_join', 'text_length', 'text_isEmpty',
            'variables_get', 'variables_set',
            'procedures_defreturn', 'procedures_defnoreturn', 'procedures_callreturn', 'procedures_callnoreturn',
            'lists_create_with' // Базовая поддержка массивов
        ];
        
        standardBlocks.forEach(type => {
            if (Blockly.JavaScript.forBlock[type]) {
                Blockly.Arduino.forBlock[type] = function(block, generator) {
                    return Blockly.JavaScript.forBlock[type](block, generator);
                };
            }
        });
    }

    // =================================================================
    // 3. РЕАЛИЗАЦИЯ ГЕНЕРАТОРОВ ДЛЯ ESP32
    // =================================================================

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
        const val = generator.valueToCode(block, 'VAL', Blockly.Arduino.ORDER_NONE) || '0';
        // Простая реализация через analogWrite (в ESP32 Core v2+ она мапится на ledc)
        return `analogWrite(${pin}, ${val});\n`;
    };

    // --- TIME ---
    Blockly.Arduino.forBlock['esp32_delay'] = function(block, generator) {
        const ms = generator.valueToCode(block, 'MS', Blockly.Arduino.ORDER_NONE) || '0';
        return `delay(${ms});\n`;
    };

    Blockly.Arduino.forBlock['esp32_millis'] = function(block) {
        return ['millis()', Blockly.Arduino.ORDER_ATOMIC];
    };

    // --- SERIAL ---
    Blockly.Arduino.forBlock['esp32_serial_init'] = function(block) {
        const baud = block.getFieldValue('BAUD');
        Blockly.Arduino.setups_['serial_init'] = `Serial.begin(${baud});`;
        return '';
    };

    Blockly.Arduino.forBlock['esp32_serial_print'] = function(block, generator) {
        const msg = generator.valueToCode(block, 'MSG', Blockly.Arduino.ORDER_NONE) || '""';
        const nl = block.getFieldValue('NL') === 'TRUE';
        return `Serial.${nl ? 'println' : 'print'}(${msg});\n`;
    };

    Blockly.Arduino.forBlock['esp32_serial_available'] = function(block) {
        return ['Serial.available() > 0', Blockly.Arduino.ORDER_ATOMIC];
    };

    // --- ПРЕРЫВАНИЯ ---
    Blockly.Arduino.forBlock['esp32_interrupt'] = function(block, generator) {
        const pin = block.getFieldValue('PIN');
        const mode = block.getFieldValue('MODE');
        // Генерируем тело функции прерывания
        const branch = generator.statementToCode(block, 'DO');
        const funcName = `ISR_Pin_${pin}`;
        
        Blockly.Arduino.definitions_[`isr_${pin}`] = `
void IRAM_ATTR ${funcName}() {
${branch}
}`;
        Blockly.Arduino.setups_[`attach_isr_${pin}`] = `pinMode(${pin}, INPUT_PULLUP);\n  attachInterrupt(digitalPinToInterrupt(${pin}), ${funcName}, ${mode});`;
        return '';
    };

    // --- LCD ---
    Blockly.Arduino.forBlock['lcd_i2c_init'] = function(block) {
        const addr = block.getFieldValue('ADDR');
        const cols = block.getFieldValue('COLS');
        const rows = block.getFieldValue('ROWS');
        
        Blockly.Arduino.libraries_['wire'] = '#include <Wire.h>';
        Blockly.Arduino.libraries_['lcd'] = '#include <LiquidCrystal_I2C.h>';
        Blockly.Arduino.definitions_['lcd_obj'] = `LiquidCrystal_I2C lcd(0x${addr}, ${cols}, ${rows});`;
        Blockly.Arduino.setups_['lcd_init'] = `lcd.init();\n  lcd.backlight();`;
        return '';
    };

    Blockly.Arduino.forBlock['lcd_i2c_print'] = function(block, generator) {
        const text = generator.valueToCode(block, 'TEXT', Blockly.Arduino.ORDER_NONE) || '""';
        const row = block.getFieldValue('ROW');
        const col = block.getFieldValue('COL');
        return `lcd.setCursor(${col}, ${row});\nlcd.print(${text});\n`;
    };

    Blockly.Arduino.forBlock['lcd_i2c_clear'] = function(block) {
        return `lcd.clear();\n`;
    };

    // --- OLED ---
    Blockly.Arduino.forBlock['oled_init'] = function(block) {
        Blockly.Arduino.libraries_['wire'] = '#include <Wire.h>';
        Blockly.Arduino.libraries_['gfx'] = '#include <Adafruit_GFX.h>';
        Blockly.Arduino.libraries_['ssd1306'] = '#include <Adafruit_SSD1306.h>';
        Blockly.Arduino.definitions_['oled_obj'] = `Adafruit_SSD1306 display(128, 64, &Wire, -1);`;
        Blockly.Arduino.setups_['oled_init'] = `
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { 
    Serial.println(F("SSD1306 allocation failed"));
  }
  display.clearDisplay();
  display.setTextColor(WHITE);
  display.display();`;
        return '';
    };

    Blockly.Arduino.forBlock['oled_print'] = function(block, generator) {
        const text = generator.valueToCode(block, 'TEXT', Blockly.Arduino.ORDER_NONE) || '""';
        const size = block.getFieldValue('SIZE');
        const x = block.getFieldValue('X');
        const y = block.getFieldValue('Y');
        return `display.setTextSize(${size});\ndisplay.setCursor(${x}, ${y});\ndisplay.print(${text});\n`;
    };

    Blockly.Arduino.forBlock['oled_display'] = function() {
        return `display.display();\n`;
    };
    Blockly.Arduino.forBlock['oled_clear'] = function() {
        return `display.clearDisplay();\n`;
    };


    // =================================================================
    // 4. ИНИЦИАЛИЗАЦИЯ И РЕНДЕРИНГ
    // =================================================================
    
    // Загрузка сохраненного состояния (Persistence)
    try {
        const saved = localStorage.getItem('blockly_workspace');
        if (saved && window.workspace) {
            Blockly.serialization.workspaces.load(JSON.parse(saved), window.workspace);
        }
    } catch(e) { console.warn("Нет сохраненных блоков"); }

    window.workspace = Blockly.inject(blocklyDiv, {
        toolbox: getToolboxConfig(),
        media: 'https://unpkg.com/blockly/media/',
        grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
        zoom: { controls: true, wheel: true },
        trashcan: true
    });

    // Автосохранение и Генерация
    window.workspace.addChangeListener((e) => {
        if (e.isUiEvent) return;
        
        // 1. Сохраняем состояние
        const state = Blockly.serialization.workspaces.save(window.workspace);
        localStorage.setItem('blockly_workspace', JSON.stringify(state));

        // 2. Генерируем код
        generateFullCode();
    });
});

// =================================================================
// 5. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// =================================================================

function generateFullCode() {
    try {
        // Принудительно вызываем init для обновления переменных
        Blockly.Arduino.init(window.workspace);
        
        const code = Blockly.Arduino.workspaceToCode(window.workspace);
        const libs = Object.values(Blockly.Arduino.libraries_ || {}).join('\n');
        const defs = Object.values(Blockly.Arduino.definitions_ || {}).join('\n');
        const setups = Object.values(Blockly.Arduino.setups_ || {}).join('\n  ');

        const fullCode = `
/* Сгенерировано ESP32 Blockly */
#include <Arduino.h>
${libs}

// Определения
${defs}

void setup() {
  Serial.begin(115200);
  ${setups}
}

void loop() {
${code}
  delay(1); // Watchdog protection
}
`;
        if (window.codeViewer) window.codeViewer.setCode(fullCode, 'cpp');
        return fullCode;
    } catch (e) {
        console.error(e);
        return "// Ошибка генерации: " + e.message;
    }
}

// Конфигурация меню (Toolbox)
function getToolboxConfig() {
    return {
        'kind': 'categoryToolbox',
        'contents': [
            {
                'kind': 'category',
                'name': 'Логика',
                'colour': '210',
                'contents': [
                    { 'kind': 'block', 'type': 'controls_if' },
                    { 'kind': 'block', 'type': 'logic_compare' },
                    { 'kind': 'block', 'type': 'logic_operation' },
                    { 'kind': 'block', 'type': 'logic_negate' },
                    { 'kind': 'block', 'type': 'logic_boolean' }
                ]
            },
            {
                'kind': 'category',
                'name': 'Циклы',
                'colour': '120',
                'contents': [
                    { 'kind': 'block', 'type': 'controls_repeat_ext', 'inputs': {'TIMES': {'shadow': {'type': 'math_number', 'fields': {'NUM': 10}}}} },
                    { 'kind': 'block', 'type': 'controls_whileUntil' },
                    { 'kind': 'block', 'type': 'controls_for' }
                ]
            },
            {
                'kind': 'category',
                'name': 'Математика',
                'colour': '230',
                'contents': [
                    { 'kind': 'block', 'type': 'math_number' },
                    { 'kind': 'block', 'type': 'math_arithmetic' },
                    { 'kind': 'block', 'type': 'math_single' }, // корень, abs
                    { 'kind': 'block', 'type': 'math_random_int' },
                    { 'kind': 'block', 'type': 'math_constrain' }
                ]
            },
            {
                'kind': 'category',
                'name': 'Текст',
                'colour': '160',
                'contents': [
                    { 'kind': 'block', 'type': 'text' },
                    { 'kind': 'block', 'type': 'text_join' },
                    { 'kind': 'block', 'type': 'text_length' }
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
                'name': 'Массивы',
                'custom': 'VARIABLE', // Простой вариант через переменные, или можно включить стандартные списки:
                'contents': [
                     { 'kind': 'block', 'type': 'lists_create_with' }
                ]
            },
            {
                'kind': 'category',
                'name': 'Функции',
                'custom': 'PROCEDURE',
                'colour': '290'
            },
            { 'kind': 'sep' },
            {
                'kind': 'category',
                'name': 'Входы / Выходы',
                'colour': '160',
                'contents': [
                    { 'kind': 'block', 'type': 'esp32_pin_mode' },
                    { 'kind': 'block', 'type': 'esp32_digital_write' },
                    { 'kind': 'block', 'type': 'esp32_digital_read' },
                    { 'kind': 'block', 'type': 'esp32_pwm_write' },
                    { 'kind': 'block', 'type': 'esp32_analog_read' }
                ]
            },
            {
                'kind': 'category',
                'name': 'Время',
                'colour': '65',
                'contents': [
                    { 'kind': 'block', 'type': 'esp32_delay' },
                    { 'kind': 'block', 'type': 'esp32_millis' }
                ]
            },
            {
                'kind': 'category',
                'name': 'Монитор порта',
                'colour': '20',
                'contents': [
                    { 'kind': 'block', 'type': 'esp32_serial_init' },
                    { 'kind': 'block', 'type': 'esp32_serial_print' },
                    { 'kind': 'block', 'type': 'esp32_serial_available' }
                ]
            },
            {
                'kind': 'category',
                'name': 'Прерывания',
                'colour': '290',
                'contents': [
                    { 'kind': 'block', 'type': 'esp32_interrupt' }
                ]
            },
            {
                'kind': 'category',
                'name': 'Дисплей LCD',
                'colour': '190',
                'contents': [
                    { 'kind': 'block', 'type': 'lcd_i2c_init' },
                    { 'kind': 'block', 'type': 'lcd_i2c_print' },
                    { 'kind': 'block', 'type': 'lcd_i2c_clear' }
                ]
            },
            {
                'kind': 'category',
                'name': 'Дисплей OLED',
                'colour': '180',
                'contents': [
                    { 'kind': 'block', 'type': 'oled_init' },
                    { 'kind': 'block', 'type': 'oled_print' },
                    { 'kind': 'block', 'type': 'oled_display' },
                    { 'kind': 'block', 'type': 'oled_clear' }
                ]
            }
        ]
    };
}
