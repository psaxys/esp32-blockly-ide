// Определение блока Deep Sleep
Blockly.Blocks['esp32_deep_sleep'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Уйти в Deep Sleep");
    this.appendValueInput("SECONDS")
        .setCheck("Number")
        .appendField("на");
    this.appendDummyInput()
        .appendField("сек.");
    this.setPreviousStatement(true, null);
    this.setNextStatement(false); // После глубокого сна код не выполняется
    this.setColour(290);
    this.setTooltip("ESP32 уснет и проснется через указанное время");
  }
};

// Генератор кода C++ для Deep Sleep
Blockly.JavaScript['esp32_deep_sleep'] = function(block) {
  var seconds = Blockly.JavaScript.valueToCode(block, 'SECONDS', Blockly.JavaScript.ORDER_ATOMIC) || '10';
  
  // Код для настройки таймера и ухода в сон
  var code = `
  Serial.println("Ухожу в сон...");
  esp_sleep_enable_timer_wakeup(${seconds} * 1000000ULL); 
  esp_deep_sleep_start();
  `;
  return code;
};

// Блок WiFi (с полями ввода)
Blockly.Blocks['esp32_wifi_connect'] = {
  init: function() {
    this.appendDummyInput().appendField("Подключить WiFi");
    this.appendDummyInput().appendField("SSID:").appendField(new Blockly.FieldTextInput("My_Network"), "SSID");
    this.appendDummyInput().appendField("PASS:").appendField(new Blockly.FieldTextInput("12345678"), "PASS");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(230);
  }
};

Blockly.JavaScript['esp32_wifi_connect'] = function(block) {
  var ssid = block.getFieldValue('SSID');
  var pass = block.getFieldValue('PASS');
  Blockly.JavaScript.definitions_['include_wifi'] = '#include <WiFi.h>';
  return `WiFi.begin("${ssid}", "${pass}");\nwhile (WiFi.status() != WL_CONNECTED) { delay(500); }\n`;
};
