if (!Blockly.JavaScript) {
    Blockly.JavaScript = new Blockly.Generator('JavaScript');
}
Blockly.JavaScript.ORDER_ATOMIC = 0;

// Вспомогательная функция для добавления инклудов
const addInclude = (key, value) => {
    if (!Blockly.JavaScript.definitions_) Blockly.JavaScript.definitions_ = {};
    Blockly.JavaScript.definitions_[key] = value;
};

// --- 1. ВРЕМЯ (Time) ---
Blockly.Blocks['esp32_delay'] = {
    init: function() {
        this.appendDummyInput().appendField("Ждать").appendField(new Blockly.FieldNumber(1000), "MS").appendField("мс");
        this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(65);
    }
};
Blockly.JavaScript['esp32_delay'] = (block) => `delay(${block.getFieldValue('MS')});\n`;

Blockly.Blocks['esp32_millis'] = {
    init: function() {
        this.appendDummyInput().appendField("мс с момента старта");
        this.setOutput(true, "Number"); this.setColour(65);
    }
};
Blockly.JavaScript['esp32_millis'] = () => ['millis()', Blockly.JavaScript.ORDER_ATOMIC];

// --- 2. ВХОДЫ / ВЫХОДЫ (I/O) ---
Blockly.Blocks['esp32_digital_write'] = {
    init: function() {
        this.appendDummyInput().appendField("Пин").appendField(new Blockly.FieldNumber(2), "PIN")
            .appendField("статус").appendField(new Blockly.FieldDropdown([["ВКЛ","HIGH"],["ВЫКЛ","LOW"]]), "VAL");
        this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(20);
    }
};
Blockly.JavaScript['esp32_digital_write'] = (block) => {
    return `pinMode(${block.getFieldValue('PIN')}, OUTPUT);\ndigitalWrite(${block.getFieldValue('PIN')}, ${block.getFieldValue('VAL')});\n`;
};

Blockly.Blocks['esp32_pwm_write'] = {
    init: function() {
        this.appendDummyInput().appendField("ШИМ Пин").appendField(new Blockly.FieldNumber(2), "PIN");
        this.appendValueInput("VAL").setCheck("Number").appendField("Значение (0-255)");
        this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(20);
    }
};
Blockly.JavaScript['esp32_pwm_write'] = (block) => {
    const pin = block.getFieldValue('PIN');
    const val = Blockly.JavaScript.valueToCode(block, 'VAL', Blockly.JavaScript.ORDER_ATOMIC) || '0';
    addInclude('pwm_init', `// PWM init logic`);
    return `ledcAttachPin(${pin}, 0);\nledcSetup(0, 5000, 8);\nledcWrite(0, ${val});\n`;
};

// --- 3. ПРЕРЫВАНИЯ (Interrupts) ---
Blockly.Blocks['esp32_interrupt'] = {
    init: function() {
        this.appendDummyInput().appendField("Прерывание на пине").appendField(new Blockly.FieldNumber(4), "PIN")
            .appendField("режим").appendField(new Blockly.FieldDropdown([["Изменение","CHANGE"],["Рост","RISING"],["Спад","FALLING"]]), "MODE");
        this.appendStatementInput("DO").appendField("делать");
        this.setColour(0);
    }
};
Blockly.JavaScript['esp32_interrupt'] = (block) => {
    const pin = block.getFieldValue('PIN');
    const mode = block.getFieldValue('MODE');
    const branch = Blockly.JavaScript.statementToCode(block, 'DO');
    addInclude(`isr_${pin}`, `void IRAM_ATTR handle_${pin}() {\n${branch}\n}`);
    return `attachInterrupt(${pin}, handle_${pin}, ${mode});\n`;
};

// --- 4. МОНИТОР ПОРТА (Serial) ---
Blockly.Blocks['esp32_serial_print'] = {
    init: function() {
        this.appendValueInput("TEXT").appendField("Печать в Serial");
        this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(160);
    }
};
Blockly.JavaScript['esp32_serial_print'] = (block) => {
    const msg = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_ATOMIC) || '""';
    return `Serial.println(${msg});\n`;
};

// --- 5. МОДУЛИ СВЯЗИ (WiFi) ---
Blockly.Blocks['esp32_wifi_connect'] = {
    init: function() {
        this.appendDummyInput().appendField("WiFi SSID").appendField(new Blockly.FieldTextInput("SSID"), "SSID");
        this.appendDummyInput().appendField("PASS").appendField(new Blockly.FieldTextInput("PASS"), "PASS");
        this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(230);
    }
};
Blockly.JavaScript['esp32_wifi_connect'] = (block) => {
    addInclude('wifi', '#include <WiFi.h>');
    return `WiFi.begin("${block.getFieldValue('SSID')}", "${block.getFieldValue('PASS')}");\nwhile (WiFi.status() != WL_CONNECTED) delay(500);\n`;
};

// --- 6. ДИСПЛЕИ (OLED / LCD) ---
Blockly.Blocks['esp32_oled_init'] = {
    init: function() {
        this.appendDummyInput().appendField("Инициализировать OLED (I2C)");
        this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(200);
    }
};
Blockly.JavaScript['esp32_oled_init'] = () => {
    addInclude('oled', '#include <Adafruit_SSD1306.h>\nAdafruit_SSD1306 oled(128, 64, &Wire, -1);');
    return `oled.begin(SSD1306_SWITCHCAPVCC, 0x3C);\noled.clearDisplay();\noled.display();\n`;
};

Blockly.Blocks['esp32_oled_print'] = {
    init: function() {
        this.appendValueInput("TXT").appendField("OLED Печать");
        this.appendDummyInput().appendField("X").appendField(new Blockly.FieldNumber(0), "X").appendField("Y").appendField(new Blockly.FieldNumber(0), "Y");
        this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(200);
    }
};
Blockly.JavaScript['esp32_oled_print'] = (block) => {
    const txt = Blockly.JavaScript.valueToCode(block, 'TXT', Blockly.JavaScript.ORDER_ATOMIC) || '""';
    return `oled.setCursor(${block.getFieldValue('X')}, ${block.getFieldValue('Y')});\noled.print(${txt});\noled.display();\n`;
};

// --- 7. МОТОРЫ (Servo) ---
Blockly.Blocks['esp32_servo_move'] = {
    init: function() {
        this.appendDummyInput().appendField("Серво Пин").appendField(new Blockly.FieldNumber(18), "PIN");
        this.appendValueInput("DEG").setCheck("Number").appendField("Угол (0-180)");
        this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(190);
    }
};
Blockly.JavaScript['esp32_servo_move'] = (block) => {
    const pin = block.getFieldValue('PIN');
    const deg = Blockly.JavaScript.valueToCode(block, 'DEG', Blockly.JavaScript.ORDER_ATOMIC) || '0';
    addInclude('servo', '#include <ESP32Servo.h>\nServo srv;');
    return `srv.attach(${pin});\nsrv.write(${deg});\n`;
};

// --- 8. СЕНСОРЫ (DHT, Hall, Touch) ---
Blockly.Blocks['esp32_dht_read'] = {
    init: function() {
        this.appendDummyInput().appendField("DHT Пин").appendField(new Blockly.FieldNumber(4), "PIN")
            .appendField("Тип").appendField(new Blockly.FieldDropdown([["Темп.","T"],["Влаж.","H"]]), "TYPE");
        this.setOutput(true, "Number"); this.setColour(45);
    }
};
Blockly.JavaScript['esp32_dht_read'] = (block) => {
    addInclude('dht', '#include <DHT.h>\nDHT dht(4, DHT11);');
    const type = block.getFieldValue('TYPE') === 'T' ? 'readTemperature()' : 'readHumidity()';
    return [`dht.${type}`, Blockly.JavaScript.ORDER_ATOMIC];
};

// --- 9. МЕСТО ХРАНЕНИЯ (LittleFS) ---
Blockly.Blocks['esp32_spiffs_write'] = {
    init: function() {
        this.appendDummyInput().appendField("Записать в файл").appendField(new Blockly.FieldTextInput("/log.txt"), "FN");
        this.appendValueInput("VAL").appendField("Текст");
        this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(230);
    }
};
Blockly.JavaScript['esp32_spiffs_write'] = (block) => {
    addInclude('fs', '#include "LittleFS.h"');
    const val = Blockly.JavaScript.valueToCode(block, 'VAL', Blockly.JavaScript.ORDER_ATOMIC) || '""';
    return `File f = LittleFS.open("${block.getFieldValue('FN')}", "a");\nif(f) { f.println(${val}); f.close(); }\n`;
};
