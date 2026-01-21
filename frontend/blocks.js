// Проверка и инициализация генератора JavaScript
if (!Blockly.JavaScript) {
    Blockly.JavaScript = new Blockly.Generator('JavaScript');
}

const generator = Blockly.JavaScript;
generator.ORDER_ATOMIC = 0;

// === ИСПРАВЛЕНИЕ: Инициализация переменных (для версий Blockly v12+) ===
generator.init = function(workspace) {
    // Создаем объект для хранения инклудов и глобальных переменных
    generator.definitions_ = Object.create(null);
    // Создаем базу данных имен переменных
    generator.variableDB_ = new Blockly.Names(generator.NAME_TYPE);
    
    var defvars = [];
    // Используем современный метод getVariableMap() вместо устаревшего getAllVariables()
    var variables = workspace.getVariableMap().getAllVariables();
    
    if (variables.length > 0) {
        for (var i = 0; i < variables.length; i++) {
            // Объявляем все переменные как float по умолчанию для простоты
            defvars.push('float ' + generator.variableDB_.getName(variables[i].name, Blockly.VARIABLE_CATEGORY_NAME) + ' = 0;');
        }
        generator.definitions_['variables'] = defvars.join('\n');
    }
};

// Вспомогательная функция для добавления определений
function addDefinition(key, code) {
    generator.definitions_[key] = code;
}

// ==========================================
// КАТЕГОРИЯ: ВРЕМЯ
// ==========================================
Blockly.Blocks['esp32_delay'] = {
    init: function() {
        this.appendDummyInput().appendField("Ждать (Delay)").appendField(new Blockly.FieldNumber(1000), "MS").appendField("мс");
        this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(65);
    }
};
generator['esp32_delay'] = function(block) {
    return `delay(${block.getFieldValue('MS')});\n`;
};

Blockly.Blocks['esp32_millis'] = {
    init: function() {
        this.appendDummyInput().appendField("Время с старта (мс)");
        this.setOutput(true, "Number"); this.setColour(65);
    }
};
generator['esp32_millis'] = function(block) {
    return [`millis()`, generator.ORDER_ATOMIC];
};

// ==========================================
// КАТЕГОРИЯ: ВХОДЫ / ВЫХОДЫ
// ==========================================
Blockly.Blocks['esp32_digital_write'] = {
    init: function() {
        this.appendDummyInput().appendField("Цифровой Писать Пин").appendField(new Blockly.FieldNumber(2), "PIN");
        this.appendDummyInput().appendField("Уровень").appendField(new Blockly.FieldDropdown([["ВЫСОКИЙ (3.3V)","HIGH"],["НИЗКИЙ (GND)","LOW"]]), "VAL");
        this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(20);
    }
};
generator['esp32_digital_write'] = function(block) {
    const pin = block.getFieldValue('PIN');
    return `pinMode(${pin}, OUTPUT);\ndigitalWrite(${pin}, ${block.getFieldValue('VAL')});\n`;
};

Blockly.Blocks['esp32_digital_read'] = {
    init: function() {
        this.appendDummyInput().appendField("Цифровой Читать Пин").appendField(new Blockly.FieldNumber(4), "PIN");
        this.setOutput(true, "Boolean"); this.setColour(20);
    }
};
generator['esp32_digital_read'] = function(block) {
    return [`digitalRead(${block.getFieldValue('PIN')})`, generator.ORDER_ATOMIC];
};

Blockly.Blocks['esp32_analog_read'] = {
    init: function() {
        this.appendDummyInput().appendField("Аналоговый Читать Пин").appendField(new Blockly.FieldNumber(34), "PIN");
        this.setOutput(true, "Number"); this.setColour(20);
    }
};
generator['esp32_analog_read'] = function(block) {
    return [`analogRead(${block.getFieldValue('PIN')})`, generator.ORDER_ATOMIC];
};

Blockly.Blocks['esp32_pwm_write'] = {
    init: function() {
        this.appendDummyInput().appendField("ШИМ (PWM) Пин").appendField(new Blockly.FieldNumber(2), "PIN");
        this.appendValueInput("VAL").setCheck("Number").appendField("Значение (0-255)");
        this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(20);
    }
};
generator['esp32_pwm_write'] = function(block) {
    const pin = block.getFieldValue('PIN');
    const val = generator.valueToCode(block, 'VAL', generator.ORDER_ATOMIC) || '0';
    // Простая реализация через analogWrite (поддерживается в новых ядрах ESP32 Arduino)
    // Если нужно старое ядро, тут нужен ledcSetup/ledcAttachPin
    return `analogWrite(${pin}, ${val});\n`;
};

// ==========================================
// КАТЕГОРИЯ: ПРЕРЫВАНИЯ
// ==========================================
Blockly.Blocks['esp32_interrupt'] = {
    init: function() {
        this.appendDummyInput().appendField("Прерывание Пин").appendField(new Blockly.FieldNumber(4), "PIN");
        this.appendDummyInput().appendField("Триггер").appendField(new Blockly.FieldDropdown([["CHANGE","CHANGE"],["RISING","RISING"],["FALLING","FALLING"]]), "MODE");
        this.appendStatementInput("DO").appendField("Выполнить");
        this.setColour(0);
    }
};
generator['esp32_interrupt'] = function(block) {
    const pin = block.getFieldValue('PIN');
    const mode = block.getFieldValue('MODE');
    const branch = generator.statementToCode(block, 'DO');
    const funcName = `isr_gpio_${pin}`;
    
    // Генерируем отдельную функцию ISR
    addDefinition(funcName, `void IRAM_ATTR ${funcName}() {\n${branch}\n}`);
    
    return `attachInterrupt(digitalPinToInterrupt(${pin}), ${funcName}, ${mode});\n`;
};

// ==========================================
// КАТЕГОРИЯ: СЕНСОРЫ
// ==========================================
Blockly.Blocks['esp32_dht_read'] = {
    init: function() {
        this.appendDummyInput().appendField("DHT11 Пин").appendField(new Blockly.FieldNumber(4), "PIN");
        this.appendDummyInput().appendField("Данные").appendField(new Blockly.FieldDropdown([["Температура","readTemperature()"],["Влажность","readHumidity()"]]), "TYPE");
        this.setOutput(true, "Number"); this.setColour(45);
    }
};
generator['esp32_dht_read'] = function(block) {
    const pin = block.getFieldValue('PIN');
    // Добавляем объект DHT глобально
    addDefinition(`dht_${pin}`, `#include <DHT.h>\nDHT dht_${pin}(${pin}, DHT11);`);
    // Инициализация в setup не обязательна для DHT в простых примерах, но лучше добавить
    // Но так как generator.definitions_ это просто строки, мы полагаемся на конструктор.
    return [`dht_${pin}.${block.getFieldValue('TYPE')}`, generator.ORDER_ATOMIC];
};

Blockly.Blocks['esp32_touch_read'] = {
    init: function() {
        this.appendDummyInput().appendField("Touch Сенсор Пин").appendField(new Blockly.FieldNumber(15), "PIN");
        this.setOutput(true, "Number"); this.setColour(45);
    }
};
generator['esp32_touch_read'] = function(block) {
    return [`touchRead(${block.getFieldValue('PIN')})`, generator.ORDER_ATOMIC];
};

Blockly.Blocks['esp32_hall_read'] = {
    init: function() {
        this.appendDummyInput().appendField("Датчик Холла (Internal)");
        this.setOutput(true, "Number"); this.setColour(45);
    }
};
generator['esp32_hall_read'] = function(block) {
    return [`hallRead()`, generator.ORDER_ATOMIC];
};

// ==========================================
// КАТЕГОРИЯ: МОТОРЫ
// ==========================================
Blockly.Blocks['esp32_servo_move'] = {
    init: function() {
        this.appendDummyInput().appendField("Серво Пин").appendField(new Blockly.FieldNumber(18), "PIN");
        this.appendValueInput("DEG").setCheck("Number").appendField("Угол (0-180)");
        this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(190);
    }
};
generator['esp32_servo_move'] = function(block) {
    const pin = block.getFieldValue('PIN');
    const deg = generator.valueToCode(block, 'DEG', generator.ORDER_ATOMIC) || '0';
    addDefinition('include_servo', '#include <ESP32Servo.h>');
    addDefinition(`servo_${pin}`, `Servo servo_${pin};`);
    
    // В loop мы каждый раз делаем attach, это не идеально, но для блочного кода безопасно
    return `if(!servo_${pin}.attached()) servo_${pin}.attach(${pin});\nservo_${pin}.write(${deg});\n`;
};

// ==========================================
// КАТЕГОРИЯ: ДИСПЛЕИ
// ==========================================
Blockly.Blocks['esp32_oled_init'] = {
    init: function() {
        this.appendDummyInput().appendField("Иниц. OLED SSD1306 (I2C)");
        this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(200);
    }
};
generator['esp32_oled_init'] = function(block) {
    addDefinition('include_oled', '#include <Adafruit_SSD1306.h>\n#include <Wire.h>');
    addDefinition('obj_oled', 'Adafruit_SSD1306 display(128, 64, &Wire, -1);');
    return `display.begin(SSD1306_SWITCHCAPVCC, 0x3C);\ndisplay.clearDisplay();\ndisplay.display();\n`;
};

Blockly.Blocks['esp32_oled_print'] = {
    init: function() {
        this.appendValueInput("TXT").appendField("OLED Печать");
        this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(200);
    }
};
generator['esp32_oled_print'] = function(block) {
    const txt = generator.valueToCode(block, 'TXT', generator.ORDER_ATOMIC) || '""';
    return `display.setTextSize(1);\ndisplay.setTextColor(WHITE);\ndisplay.setCursor(0,0);\ndisplay.print(${txt});\ndisplay.display();\n`;
};

Blockly.Blocks['esp32_lcd_init'] = {
    init: function() {
        this.appendDummyInput().appendField("Иниц. LCD 16x2 (I2C) Адрес 0x27");
        this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(200);
    }
};
generator['esp32_lcd_init'] = function(block) {
    addDefinition('include_lcd', '#include <LiquidCrystal_I2C.h>');
    addDefinition('obj_lcd', 'LiquidCrystal_I2C lcd(0x27, 16, 2);');
    return `lcd.init();\nlcd.backlight();\n`;
};

// ==========================================
// КАТЕГОРИЯ: СВЯЗЬ
// ==========================================
Blockly.Blocks['esp32_serial_print'] = {
    init: function() {
        this.appendValueInput("TXT").appendField("Serial Print");
        this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(160);
    }
};
generator['esp32_serial_print'] = function(block) {
    const txt = generator.valueToCode(block, 'TXT', generator.ORDER_ATOMIC) || '""';
    return `Serial.println(${txt});\n`;
};

Blockly.Blocks['esp32_wifi_connect'] = {
    init: function() {
        this.appendDummyInput().appendField("Подкл. к WiFi SSID").appendField(new Blockly.FieldTextInput("MyWiFi"), "SSID");
        this.appendDummyInput().appendField("Пароль").appendField(new Blockly.FieldTextInput("12345678"), "PASS");
        this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(230);
    }
};
generator['esp32_wifi_connect'] = function(block) {
    const ssid = block.getFieldValue('SSID');
    const pass = block.getFieldValue('PASS');
    addDefinition('include_wifi', '#include <WiFi.h>');
    return `WiFi.begin("${ssid}", "${pass}");\nwhile(WiFi.status() != WL_CONNECTED) { delay(500); }\n`;
};

// ==========================================
// КАТЕГОРИЯ: ХРАНИЛИЩЕ
// ==========================================
Blockly.Blocks['esp32_spiffs_write'] = {
    init: function() {
        this.appendDummyInput().appendField("Записать в файл").appendField(new Blockly.FieldTextInput("/log.txt"), "PATH");
        this.appendValueInput("DATA").appendField("Данные");
        this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(260);
    }
};
generator['esp32_spiffs_write'] = function(block) {
    addDefinition('include_fs', '#include "LittleFS.h"');
    const path = block.getFieldValue('PATH');
    const data = generator.valueToCode(block, 'DATA', generator.ORDER_ATOMIC) || '""';
    return `File f = LittleFS.open("${path}", "a");\nif(f){ f.println(${data}); f.close(); }\n`;
};
