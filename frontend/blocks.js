Blockly.Blocks['esp32_wifi_connect'] = {
  init: function() {
    this.appendDummyInput().appendField("WiFi Connect");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(230);
  }
};

Blockly.JavaScript['esp32_wifi_connect'] = function(block) {
  return '#include <WiFi.h>\nvoid setup_wifi() { WiFi.begin("SSID", "PASS"); }\n';
};

// Генератор для Deep Sleep
Blockly.JavaScript['esp32_deep_sleep'] = function(block) {
  var seconds = Blockly.JavaScript.valueToCode(block, 'SECONDS', Blockly.JavaScript.ORDER_ATOMIC) || '10';
  
  // ESP32 использует микросекунды, поэтому умножаем на 1 000 000
  var code = `
  esp_sleep_enable_timer_wakeup(${seconds} * 1000000ULL);
  esp_deep_sleep_start();
  `;
  return code;
};
