// Инициализация генератора
if (!Blockly.JavaScript) {
    Blockly.JavaScript = new Blockly.Generator('JavaScript');
}
Blockly.JavaScript.ORDER_ATOMIC = 0;

// Исправление для переменных (поддержка v12+)
Blockly.JavaScript.init = function(workspace) {
    Blockly.JavaScript.definitions_ = Object.create(null);
    Blockly.JavaScript.variableDB_ = new Blockly.Names(Blockly.JavaScript.NAME_TYPE);
    var defvars = [];
    var variables = workspace.getVariableMap().getAllVariables();
    for (var i = 0; i < variables.length; i++) {
        defvars.push('float ' + Blockly.JavaScript.variableDB_.getName(variables[i].name, Blockly.VARIABLE_CATEGORY_NAME) + ' = 0;');
    }
    Blockly.JavaScript.definitions_['variables'] = defvars.join('\n');
};

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
const addDef = (key, text) => { Blockly.JavaScript.definitions_[key] = text; };

// --- КАТЕГОРИЯ: ВРЕМЯ ---
Blockly.Blocks['esp32_delay'] = {
    init: function() {
        this.appendDummyInput().appendField("Пауза").appendField(new Blockly.FieldNumber(1000), "MS").appendField("мс");
        this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(65);
    }
};
Blockly.JavaScript['esp32_delay'] = (block) => `delay(${block.getFieldValue('MS')});\n`;

Blockly.Blocks['esp32_millis'] = {
    init: function() {
        this.appendDummyInput().appendField("мс с начала работы");
        this.setOutput(true, "Number"); this.setColour(65);
    }
};
Blockly.JavaScript['esp32_millis'] = () => ['millis()', Blockly.JavaScript.ORDER_ATOMIC];

// --- КАТЕГОРИЯ: ВХОДЫ / ВЫХОДЫ ---
Blockly.Blocks['esp32_digital_write'] = {
    init: function() {
        this.appendDummyInput().appendField("Пин #").appendField(new Blockly.FieldNumber(2), "PIN")
            .appendField("в статус").appendField(new Blockly.FieldDropdown([["ВКЛ","HIGH"],["ВЫКЛ","LOW"]]), "STATE");
        this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(20);
    }
};
Blockly.JavaScript['esp32_digital_write'] = (block) => {
    const pin = block.getFieldValue('PIN');
    return `pinMode(${pin}, OUTPUT);\ndigitalWrite(${pin}, ${block.getFieldValue('STATE')});\n`;
};

Blockly.Blocks['esp32_digital_read'] = {
    init: function() {
        this.appendDummyInput().appendField("Считать Пин #").appendField(new Blockly.FieldNumber(4), "PIN");
        this.setOutput(true, "Boolean"); this.setColour(20);
    }
};
Blockly.JavaScript['esp32_digital_read'] = (block) => [`digitalRead(${block.getFieldValue('PIN')})`, Blockly.JavaScript.ORDER_ATOMIC];

Blockly.Blocks['esp32_analog_read'] = {
    init: function() {
        this.appendDummyInput().appendField("Аналог Пин #").appendField(new Blockly.FieldNumber(34), "PIN");
        this.setOutput(true, "Number"); this.setColour(20);
    }
};
Blockly.JavaScript['esp32_analog_read'] = (block) => [`analogRead(${block.getFieldValue('PIN')})`, Blockly.JavaScript.ORDER_ATOMIC];

Blockly.Blocks['esp32_pwm_write'] = {
    init: function() {
        this.appendDummyInput().appendField("ШИМ Пин #").appendField(new Blockly.FieldNumber(2), "PIN");
        this.appendValueInput("VAL").setCheck("Number").appendField("Яркость");
        this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(20);
    }
};
Blockly.JavaScript['esp32_pwm_write'] = (block) => {
    const val = Blockly.JavaScript.valueToCode(block, 'VAL', Blockly.JavaScript.ORDER_ATOMIC) || '0';
    const pin = block.getFieldValue('PIN');
    return `ledcAttachPin(${pin}, 0);\nledcSetup(0, 5000, 8);\nledcWrite(0, ${val});\n`;
};

// --- ПРЕРЫВАНИЕ ---
Blockly.Blocks['esp32_interrupt'] = {
    init: function() {
        this.appendDummyInput().appendField("Прерывание на пине").appendField(new Blockly.FieldNumber(4), "PIN")
            .appendField("режим").appendField(new Blockly.FieldDropdown([["RISING","RISING"],["FALLING","FALLING"],["CHANGE","CHANGE"]]), "MODE");
        this.appendStatementInput("DO").appendField("Делать");
        this.setColour(0);
    }
};
Blockly.JavaScript['esp32_interrupt'] = (block) => {
    const pin = block.getFieldValue('PIN');
    const branch = Blockly.JavaScript.statementToCode(block, 'DO');
    addDef(`isr_${pin}`, `void IRAM_ATTR onInterrupt_${pin}() {\n${branch}\n}`);
    return `attachInterrupt(digitalPinToInterrupt(${pin}), onInterrupt_${pin}, ${block.getFieldValue('MODE')});\n`;
};

// --- МОНИТОР ПОРТА ---
Blockly.Blocks['esp32_serial_print'] = {
    init: function() {
        this.appendValueInput("TXT").appendField("Serial: Печать");
        this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(160);
    }
};
Blockly.JavaScript['esp32_serial_print'] = (block) => {
    const txt = Blockly.JavaScript.valueToCode(block, 'TXT', Blockly.JavaScript.ORDER_ATOMIC) || '""';
    return `Serial.println(${txt});\n`;
};

Blockly.Blocks['esp32_serial_available'] = {
    init: function() {
        this.appendDummyInput().appendField("Есть данные в Serial?");
        this.setOutput(true, "Boolean"); this.setColour(160);
    }
};
Blockly.JavaScript['esp32_serial_available'] = () => ["Serial.available() > 0", Blockly.JavaScript.ORDER_ATOMIC];

// --- СЕНСОРЫ ---
Blockly.Blocks['esp32_dht_read'] = {
    init: function() {
        this.appendDummyInput().appendField("DHT Пин #").appendField(new Blockly.FieldNumber(4), "PIN")
            .appendField("тип").appendField(new Blockly.FieldDropdown([["Температура","T"],["Влажность","H"]]), "TYPE");
        this.setOutput(true, "Number"); this.setColour(45);
    }
};
Blockly.JavaScript['esp32_dht_read'] = (block) => {
    addDef('inc_dht', '#include <DHT.h>\nDHT dht(4, DHT11);');
    const func = block.getFieldValue('TYPE') === 'T' ? 'readTemperature()' : 'readHumidity()';
    return [`dht.${func}`, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['esp32_touch_read'] = {
    init: function() {
        this.appendDummyInput().appendField("Сенсор Пин #").appendField(new Blockly.FieldNumber(15), "PIN");
        this.setOutput(true, "Number"); this.setColour(45);
    }
};
Blockly.JavaScript['esp32_touch_read'] = (block) => [`touchRead(${block.getFieldValue('PIN')})`, Blockly.JavaScript.ORDER_ATOMIC];

Blockly.Blocks['esp32_hall_read'] = {
    init: function() {
        this.appendDummyInput().appendField("Магнитное поле (Hall)");
        this.setOutput(true, "Number"); this.setColour(45);
    }
};
Blockly.JavaScript['esp32_hall_read'] = () => [`hallRead()`, Blockly.JavaScript.ORDER_ATOMIC];

// --- МОТОРЫ ---
Blockly.Blocks['esp32_servo_move'] = {
    init: function() {
        this.appendDummyInput().appendField("Серво Пин #").appendField(new Blockly.FieldNumber(18), "PIN");
        this.appendValueInput("DEG").setCheck("Number").appendField("Угол (0-180)");
        this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(190);
    }
};
Blockly.JavaScript['esp32_servo_move'] = (block) => {
    addDef('inc_servo', '#include <ESP32Servo.h>\nServo myservo;');
    const deg = Blockly.JavaScript.valueToCode(block, 'DEG', Blockly.JavaScript.ORDER_ATOMIC) || '90';
    return `myservo.attach(${block.getFieldValue('PIN')});\nmyservo.write(${deg});\n`;
};

// --- ДИСПЛЕИ ---
Blockly.Blocks['esp32_oled_init'] = {
    init: function() {
        this.appendDummyInput().appendField("Инициализировать OLED (I2C)");
        this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(200);
    }
};
Blockly.JavaScript['esp32_oled_init'] = () => {
    addDef('inc_oled', '#include <Adafruit_SSD1306.h>\nAdafruit_SSD1306 display(128, 64, &Wire, -1);');
    return `display.begin(SSD1306_SWITCHCAPVCC, 0x3C);\ndisplay.clearDisplay();\n`;
};

Blockly.Blocks['esp32_oled_print'] = {
    init: function() {
        this.appendValueInput("TXT").appendField("OLED: Печать");
        this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(200);
    }
};
Blockly.JavaScript['esp32_oled_print'] = (block) => {
    const txt = Blockly.JavaScript.valueToCode(block, 'TXT', Blockly.JavaScript.ORDER_ATOMIC) || '""';
    return `display.setTextSize(1);\ndisplay.setCursor(0,0);\ndisplay.print(${txt});\ndisplay.display();\n`;
};

Blockly.Blocks['esp32_lcd_init'] = {
    init: function() {
        this.appendDummyInput().appendField("Инициализировать LCD 16x2 (I2C)");
        this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(200);
    }
};
Blockly.JavaScript['esp32_lcd_init'] = () => {
    addDef('inc_lcd', '#include <LiquidCrystal_I2C.h>\nLiquidCrystal_I2C lcd(0x27, 16, 2);');
    return `lcd.init();\nlcd.backlight();\n`;
};

// --- ХРАНИЛИЩЕ ---
Blockly.Blocks['esp32_spiffs_write'] = {
    init: function() {
        this.appendDummyInput().appendField("Записать в файл").appendField(new Blockly.FieldTextInput("/log.txt"), "FN");
        this.appendValueInput("VAL").appendField("Данные");
        this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(260);
    }
};
Blockly.JavaScript['esp32_spiffs_write'] = (block) => {
    addDef('inc_fs', '#include "LittleFS.h"');
    const val = Blockly.JavaScript.valueToCode(block, 'VAL', Blockly.JavaScript.ORDER_ATOMIC) || '""';
    return `File f = LittleFS.open("${block.getFieldValue('FN')}", "a");\nif(f) { f.println(${val}); f.close(); }\n`;
};

Blockly.Blocks['esp32_spiffs_read'] = {
    init: function() {
        this.appendDummyInput().appendField("Считать файл").appendField(new Blockly.FieldTextInput("/log.txt"), "FN");
        this.setOutput(true, "String"); this.setColour(260);
    }
};
Blockly.JavaScript['esp32_spiffs_read'] = (block) => {
    return [`LittleFS.open("${block.getFieldValue('FN')}", "r").readString()`, Blockly.JavaScript.ORDER_ATOMIC];
};

// --- СВЯЗЬ ---
Blockly.Blocks['esp32_wifi_connect'] = {
    init: function() {
        this.appendDummyInput().appendField("WiFi SSID").appendField(new Blockly.FieldTextInput("SSID"), "SSID");
        this.appendDummyInput().appendField("Пароль").appendField(new Blockly.FieldTextInput("PASS"), "PASS");
        this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(230);
    }
};
Blockly.JavaScript['esp32_wifi_connect'] = (block) => {
    addDef('inc_wifi', '#include <WiFi.h>');
    return `WiFi.begin("${block.getFieldValue('SSID')}", "${block.getFieldValue('PASS')}");\nwhile(WiFi.status() != WL_CONNECTED) delay(500);\n`;
};

Blockly.Blocks['esp32_http_get'] = {
    init: function() {
        this.appendDummyInput().appendField("HTTP GET запрос").appendField(new Blockly.FieldTextInput("http://api.com"), "URL");
        this.setOutput(true, "String"); this.setColour(230);
    }
};
Blockly.JavaScript['esp32_http_get'] = (block) => {
    addDef('inc_http', '#include <HTTPClient.h>');
    return [`[](){ HTTPClient h; h.begin("${block.getFieldValue('URL')}"); h.GET(); return h.getString(); }()`, Blockly.JavaScript.ORDER_ATOMIC];
};
