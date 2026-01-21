if (!Blockly.JavaScript) {
    Blockly.JavaScript = new Blockly.Generator('JavaScript');
}
Blockly.JavaScript.ORDER_ATOMIC = 0;

// --- БЛОК: Управление пином (Digital Write) ---
Blockly.Blocks['esp32_digital_write'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Установить Пин #")
        .appendField(new Blockly.FieldNumber(2, 0, 39), "PIN")
        .appendField("в")
        .appendField(new Blockly.FieldDropdown([["ВКЛ", "HIGH"], ["ВЫКЛ", "LOW"]]), "STATE");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(160);
  }
};

Blockly.JavaScript['esp32_digital_write'] = function(block) {
  var pin = block.getFieldValue('PIN');
  var state = block.getFieldValue('STATE');
  return `pinMode(${pin}, OUTPUT);\ndigitalWrite(${pin}, ${state});\n`;
};

// --- БЛОК: Задержка (Delay) ---
Blockly.Blocks['esp32_delay'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Ждать")
        .appendField(new Blockly.FieldNumber(1000, 0), "MS")
        .appendField("мс");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(120);
  }
};

Blockly.JavaScript['esp32_delay'] = function(block) {
  return `delay(${block.getFieldValue('MS')});\n`;
};

// --- КАТЕГОРИЯ: ПРЕРЫВАНИЯ ---
Blockly.Blocks['esp32_interrupt'] = {
  init: function() {
    this.appendDummyInput().appendField("Прерывание на Пине #").appendField(new Blockly.FieldNumber(4), "PIN");
    this.appendDummyInput().appendField("Режим").appendField(new Blockly.FieldDropdown([["CHANGE", "CHANGE"], ["RISING", "RISING"], ["FALLING", "FALLING"]]), "MODE");
    this.appendStatementInput("DO").appendField("Выполнить");
    this.setColour(0);
  }
};
Blockly.JavaScript['esp32_interrupt'] = function(block) {
  var pin = block.getFieldValue('PIN');
  var mode = block.getFieldValue('MODE');
  var statements = Blockly.JavaScript.statementToCode(block, 'DO');
  var funcName = 'handleInterrupt_' + pin;
  Blockly.JavaScript.definitions_['func_' + funcName] = `void IRAM_ATTR ${funcName}() {\n${statements}\n}`;
  return `attachInterrupt(digitalPinToInterrupt(${pin}), ${funcName}, ${mode});\n`;
};

// --- КАТЕГОРИЯ: ДИСПЛЕЙ OLED (SSD1306) ---
Blockly.Blocks['esp32_oled_init'] = {
  init: function() {
    this.appendDummyInput().appendField("Инициализировать OLED I2C 128x64");
    this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(200);
  }
};
Blockly.JavaScript['esp32_oled_init'] = function(block) {
  Blockly.JavaScript.definitions_['include_oled'] = '#include <Wire.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_SSD1306.h>\nAdafruit_SSD1306 display(128, 64, &Wire, -1);';
  return 'if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { Serial.println("OLED failed"); }\ndisplay.clearDisplay();\ndisplay.setTextColor(WHITE);\n';
};

// --- КАТЕГОРИЯ: МЕСТО ХРАНЕНИЯ (LittleFS/SPIFFS) ---
Blockly.Blocks['esp32_spiffs_write'] = {
  init: function() {
    this.appendValueInput("CONTENT").setCheck("String").appendField("Записать в файл");
    this.appendDummyInput().appendField("Путь:").appendField(new Blockly.FieldTextInput("/data.txt"), "PATH");
    this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(230);
  }
};
Blockly.JavaScript['esp32_spiffs_write'] = function(block) {
  var content = Blockly.JavaScript.valueToCode(block, 'CONTENT', Blockly.JavaScript.ORDER_ATOMIC) || '""';
  var path = block.getFieldValue('PATH');
  Blockly.JavaScript.definitions_['include_fs'] = '#include "FS.h"\n#include "LittleFS.h"';
  return `File file = LittleFS.open("${path}", FILE_WRITE);\nif(file) { file.print(${content}); file.close(); }\n`;
};

// --- КАТЕГОРИЯ: МОНИТОР ПОРТА ---
Blockly.Blocks['esp32_serial_available'] = {
  init: function() {
    this.appendDummyInput().appendField("Данные в Serial доступны?");
    this.setOutput(true, "Boolean"); this.setColour(160);
  }
};
Blockly.JavaScript['esp32_serial_available'] = function(block) {
  return ['Serial.available() > 0', Blockly.JavaScript.ORDER_ATOMIC];
};

// --- БЛОК: Аналоговое чтение (Read ADC) ---
Blockly.Blocks['esp32_analog_read'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Считать значение с Пина #")
        .appendField(new Blockly.FieldNumber(34, 0, 39), "PIN");
    this.setOutput(true, "Number");
    this.setColour(45);
  }
};

Blockly.JavaScript['esp32_analog_read'] = function(block) {
  return [`analogRead(${block.getFieldValue('PIN')})`, Blockly.JavaScript.ORDER_ATOMIC];
};

// --- WiFi и Deep Sleep (из прошлых шагов) ---
Blockly.Blocks['esp32_wifi_connect'] = {
  init: function() {
    this.appendDummyInput().appendField("WiFi: Подключить к")
        .appendField(new Blockly.FieldTextInput("SSID"), "SSID");
    this.appendDummyInput().appendField("Пароль:")
        .appendField(new Blockly.FieldTextInput("PASS"), "PASS");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(230);
  }
};

Blockly.JavaScript['esp32_wifi_connect'] = function(block) {
  const ssid = block.getFieldValue('SSID');
  const pass = block.getFieldValue('PASS');
  Blockly.JavaScript.definitions_['include_wifi'] = '#include <WiFi.h>';
  return `WiFi.begin("${ssid}", "${pass}");\nwhile (WiFi.status() != WL_CONNECTED) { delay(500); }\n`;
};

Blockly.Blocks['esp32_deep_sleep'] = {
  init: function() {
    this.appendValueInput("SECONDS").setCheck("Number").appendField("Сон на");
    this.appendDummyInput().appendField("сек.");
    this.setPreviousStatement(true);
    this.setColour(290);
  }
};

Blockly.JavaScript['esp32_deep_sleep'] = function(block) {
    const seconds = Blockly.JavaScript.valueToCode(block, 'SECONDS', Blockly.JavaScript.ORDER_ATOMIC) || '10';
    return `esp_sleep_enable_timer_wakeup(${seconds} * 1000000ULL);\nesp_deep_sleep_start();\n`;
};
